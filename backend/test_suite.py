import sys
import asyncio
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from moderation import check_sensitive_content, AUDIT_LOG_FILE
from main import app, load_scene, _evaluate_free_text
from httpx import AsyncClient, ASGITransport

async def run_tests():
    print("=== 1. KIEM TRA DOC DU LIEU CA 4 SCENE ===")
    scene_ids = ["gaming_lobby_v1", "search_results_v1", "group_chat_v1", "ingame_store_v1"]
    for sid in scene_ids:
        cfg = load_scene(sid)
        print(f"  [OK] Da load: {sid} - {cfg['title']} ({cfg['primary_risk']})")

    print("\n=== 2. KIEM TRA LOP KIEM DUYET NOI DUNG (MODERATION & PII) ===")
    test_cases = [
        ("So dien thoai VN: 0987654321", True, "Số điện thoại di động Việt Nam"),
        ("CCCD 12 so: 001202004567", True, "Dãy số dài bất thường"),
        ("Email: nguyenvana@gmail.com", True, "Địa chỉ Email cá nhân"),
        ("Link doc hai: https://hackgame.xyz/free-robux", True, "Liên kết"),
        ("Cau hoi canh giac: Ban la ai vay? Minh khong quen ban!", False, None),
        ("Cau boc dong: Cho minh xin do xin voi!", False, None)
    ]

    for text, expected_flag, expected_desc in test_cases:
        res = check_sensitive_content(text, session_id="test_session_001")
        status = "CHAN THANH CONG" if res["is_sensitive"] else "CHO QUA"
        print(f"  Text: '{text[:35]}...' -> {status} (Ly do: {res['reason']})")
        assert res["is_sensitive"] == expected_flag, f"Sai ket qua kiem duyet cho '{text}'"

    print("  [OK] Toan bo test kiem duyet PII dat chuan!")

    print("\n=== 3. KIEM TRA ENDPOINTS VOI ASGI CLIENT ===")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test GET /api/scenes
        res = await ac.get("/api/scenes")
        assert res.status_code == 200
        scenes = res.json()["scenes"]
        print(f"  [OK] GET /api/scenes tra ve {len(scenes)} scenes.")

        # Test POST /api/scenarios/initialize
        init_payload = {"scene_id": "gaming_lobby_v1", "trigger_event": "Nguoi la tang do hiem"}
        res = await ac.post("/api/scenarios/initialize", json=init_payload)
        assert res.status_code == 200
        init_data = res.json()
        session_id = init_data["session_id"]
        print(f"  [OK] Khoi tao session thanh cong: {session_id[:8]}...")

        # Test POST /api/scenarios/action voi noi dung nhay cam
        act_payload = {
            "session_id": session_id,
            "anchor_id": "npc_stranger",
            "action_id": "type_reply",
            "free_text": "So dien thoai cua minh la 0912345678, goi cho minh nha"
        }
        res = await ac.post("/api/scenarios/action", json=act_payload)
        assert res.status_code == 200
        act_data = res.json()
        assert "Cảnh báo an toàn" in act_data["npc_reply"]
        assert act_data["risk_score"] == 0.0
        print("  [OK] Action chua PII bi chan va tra ve thong diep canh bao an toan!")

        # Test POST /api/scenarios/action voi hanh vi canh giac (Bao cao)
        act_payload_safe = {
            "session_id": session_id,
            "anchor_id": "report_button",
            "action_id": "report"
        }
        res = await ac.post("/api/scenarios/action", json=act_payload_safe)
        assert res.status_code == 200
        safe_data = res.json()
        assert safe_data["ending_triggered"] == "safe_active"
        print(f"  [OK] Kich hoat ket cuc an toan thanh cong: {safe_data['ending_triggered']}")

    print("\n=== TAT CA CAC BAI KIEM TRA DEU THANH CONG! ===")

if __name__ == '__main__':
    asyncio.run(run_tests())
