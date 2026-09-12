import os
import json
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from moderation import check_sensitive_content
from fallback_templates import get_fallback_opening, evaluate_fallback_free_text

# Tải cấu hình từ file .env (tìm ở cả backend/ và thư mục gốc)
for p in [Path(__file__).parent / ".env", Path(__file__).parent.parent / ".env", Path(".env")]:
    if p.exists():
        load_dotenv(p, override=True)

app = FastAPI(title="Digital Safety Simulation - 4 Scene Demo (OpenAI Pattern)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cấu hình OpenAI Pattern
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o-mini").strip()

openai_client = None
if OPENAI_API_KEY and OPENAI_API_KEY != "your_api_key_here":
    try:
        from openai import AsyncOpenAI
        openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
        print(f"[OK] Đã kết nối OpenAI client: Model={MODEL_NAME}, BaseURL={OPENAI_BASE_URL}")
    except Exception as e:
        print(f"[CẢNH BÁO] Không thể khởi tạo OpenAI client: {e}")
else:
    print("[THÔNG BÁO] Chưa cấu hình OPENAI_API_KEY thật. Hệ thống chạy ở chế độ Fallback Templates & Rules.")

SCENES_DIR = Path(__file__).parent / "scenes"
if not SCENES_DIR.exists():
    SCENES_DIR = Path(__file__).parent.parent

sessions: Dict[str, dict] = {}


def load_scene(scene_id: str) -> dict:
    path = SCENES_DIR / f"{scene_id}.json"
    if not path.exists():
        alt_path = Path(__file__).parent.parent / f"{scene_id}.json"
        if alt_path.exists():
            path = alt_path
        else:
            raise HTTPException(404, f"Scene không tồn tại: {scene_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def find_anchor(config: dict, anchor_id: str) -> dict:
    for a in config["anchors"]:
        if a["anchor_id"] == anchor_id:
            return a
    raise HTTPException(404, f"Anchor không tồn tại: {anchor_id}")


def find_action(anchor: dict, action_id: str) -> dict:
    for act in anchor["actions"]:
        if act["action_id"] == action_id:
            return act
    raise HTTPException(404, f"Action không tồn tại: {action_id}")


# ---------------- Data contracts ----------------

class ListScenesResponse(BaseModel):
    scenes: List[dict]


class InitRequest(BaseModel):
    scene_id: str
    trigger_event: str


class InitResponse(BaseModel):
    session_id: str
    scene_config: dict
    anchor_contents: Dict[str, dict]


class ActionRequest(BaseModel):
    session_id: str
    anchor_id: str
    action_id: str
    free_text: Optional[str] = None


class ActionResponse(BaseModel):
    risk_score: float
    npc_reply: Optional[str] = None
    ending_triggered: Optional[str] = None
    ending_message: Optional[str] = None


# ---------------- Endpoints ----------------

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "llm_enabled": openai_client is not None,
        "model": MODEL_NAME,
        "base_url": OPENAI_BASE_URL,
    }


@app.get("/api/scenes", response_model=ListScenesResponse)
async def list_scenes():
    """Frontend gọi để hiển thị danh sách 4 scene."""
    scenes = []
    found_files = list(SCENES_DIR.glob("*_v1.json"))
    if not found_files:
        found_files = list(Path(__file__).parent.parent.glob("*_v1.json"))

    for path in sorted(found_files):
        try:
            cfg = json.loads(path.read_text(encoding="utf-8"))
            scenes.append({
                "scene_id": cfg["scene_id"],
                "title": cfg["title"],
                "primary_risk": cfg["primary_risk"],
                "risk_color": cfg["risk_color"],
            })
        except Exception:
            continue
    return ListScenesResponse(scenes=scenes)


@app.post("/api/scenarios/initialize", response_model=InitResponse)
async def initialize(payload: InitRequest):
    config = load_scene(payload.scene_id)
    fields_to_fill = {a["anchor_id"]: a["ai_fills"] for a in config["anchors"] if a.get("ai_fills")}

    anchor_contents = {}
    if fields_to_fill:
        if openai_client:
            prompt = f"""
            Bạn là chuyên gia thiết kế nội dung an toàn mạng cho học sinh 10-12 tuổi.
            Chủ đề rủi ro: {config['primary_risk']}.
            Tình huống kích hoạt: "{payload.trigger_event}"

            Hãy điền nội dung ngắn gọn cho các trường sau (1 câu tiếng Việt tự nhiên, phù hợp tâm lý học sinh, không bạo lực/nhạy cảm):
            {json.dumps(fields_to_fill, ensure_ascii=False)}

            Trả về ĐÚNG JSON có cấu trúc sau:
            {{"anchor_contents": {{"anchor_id": {{"field_name": "nội dung"}}}}}}
            """
            try:
                response = await openai_client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=[
                        {"role": "system", "content": "Bạn chỉ trả về JSON hợp lệ, không kèm văn bản giải thích hay markdown."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                )
                raw_json = response.choices[0].message.content
                anchor_contents = json.loads(raw_json).get("anchor_contents", {})
            except Exception as e:
                print(f"Lỗi gọi LLM khi initialize: {e}, chuyển sang fallback template.")
                anchor_contents = {}

        # Fallback an toàn nếu LLM không trả về đủ
        if not anchor_contents:
            anchor_contents = {
                aid: {f: get_fallback_opening(payload.scene_id) for f in fields}
                for aid, fields in fields_to_fill.items()
            }

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "scene_id": payload.scene_id,
        "config": config,
        "risk_score": 0.0,
        "ended": False
    }

    return InitResponse(session_id=session_id, scene_config=config, anchor_contents=anchor_contents)


@app.post("/api/scenarios/action", response_model=ActionResponse)
async def submit_action(payload: ActionRequest):
    session = sessions.get(payload.session_id)
    if not session or session["ended"]:
        raise HTTPException(400, "Session không hợp lệ hoặc đã kết thúc.")

    config = session["config"]
    anchor = find_anchor(config, payload.anchor_id)
    action = find_action(anchor, payload.action_id)

    npc_reply = None
    score_delta = 0.0

    if action.get("trigger") == "free_text" and action.get("ai_evaluates"):
        input_text = payload.free_text or ""

        # Kiểm duyệt nội dung nhạy cảm PII bằng regex
        mod_result = check_sensitive_content(input_text, session_id=payload.session_id)
        if mod_result["is_sensitive"]:
            score_delta = 0.0
            npc_reply = mod_result["warning_reply"]
        else:
            score_delta, npc_reply = await _evaluate_free_text(input_text, config["primary_risk"])
    else:
        score_delta = action.get("score_delta", 0.0)

    session["risk_score"] = max(0.0, session["risk_score"] + score_delta)

    ending_key = action.get("force_ending")
    if not ending_key and session["risk_score"] >= config["risk_thresholds"]["high"]:
        ending_key = "trapped"

    ending_message = None
    if ending_key:
        session["ended"] = True
        ending_message = config["endings"].get(ending_key, {}).get("message", "Kết thúc kịch bản.")

    return ActionResponse(
        risk_score=session["risk_score"],
        npc_reply=npc_reply,
        ending_triggered=ending_key,
        ending_message=ending_message,
    )


async def _evaluate_free_text(free_text: str, primary_risk: str) -> tuple[float, str]:
    if not openai_client:
        return evaluate_fallback_free_text(free_text)

    prompt = f"""
    Bạn là giám khảo đánh giá mức độ an toàn mạng của học sinh (10-12 tuổi).
    Loại rủi ro: "{primary_risk}".
    Câu học sinh nhập vào: "{free_text}"

    Quy tắc chấm điểm (score_delta từ -3.0 đến +3.0):
    - Điểm âm (-1 đến -3): CẢNH GIÁC / THĂM DÒ (Ví dụ: "Bạn là ai vậy?", "Mình không nhận đồ của người lạ đâu", "Để mình hỏi cô giáo đã", "Không cần đâu").
    - Điểm 0: TRUNG TÍNH (Ví dụ: "Xin chào", "Chơi vui nhé").
    - Điểm dương (+1 đến +3): BỐC ĐỒNG / DỄ TIN (Ví dụ: "Cho mình xin đi!", "Tên tài khoản mình là...", "Vâng, kết bạn với mình đi", "Ok gửi link đây").

    Hãy sinh một câu phản hồi của đối phương (npc_reply) tự nhiên, kích thích tư duy của học sinh.

    Định dạng JSON bắt buộc:
    {{"score_delta": <số thực từ -3.0 đến 3.0>, "npc_reply": "<1 câu thoại NPC bằng tiếng Việt>"}}
    """
    try:
        response = await openai_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "Bạn là giám khảo an toàn mạng. Luôn trả lời đúng cấu trúc JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        data = json.loads(response.choices[0].message.content)
        score = max(-3.0, min(3.0, float(data.get("score_delta", 0.0))))
        reply = data.get("npc_reply", "")
        return score, reply
    except Exception as e:
        print(f"Lỗi OpenAI đánh giá free-text: {e}, dùng rule-based fallback.")
        return evaluate_fallback_free_text(free_text)
