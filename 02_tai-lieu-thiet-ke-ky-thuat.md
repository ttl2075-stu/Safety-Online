# Tài liệu thiết kế kỹ thuật
## Ứng dụng mô phỏng 3D nhập vai an toàn mạng cho học sinh

Tài liệu này là bản đặc tả kỹ thuật để bắt đầu phát triển. Đi kèm với tài liệu mô tả kịch bản (01_tai-lieu-mo-ta-kich-ban.md) — tài liệu đó trả lời "dạy gì, vì sao", tài liệu này trả lời "xây bằng gì, xây như thế nào".

---

## 1. Nguyên tắc kiến trúc cốt lõi

### 1.1. Phân chia trách nhiệm: AI sinh nội dung, dev dựng cấu trúc

Đây là quyết định kiến trúc quan trọng nhất, khác biệt hoàn toàn so với bản prototype ban đầu (vốn dùng AI sinh trực tiếp hình ảnh qua DALL-E/Pollinations):

| Thành phần | Ai tạo ra | Khi nào |
|---|---|---|
| Không gian 3D, vị trí vật thể, mô hình nhân vật | Dev, dựng sẵn 1 lần | Trước khi pilot, không đổi giữa các lượt chạy |
| Cấu trúc anchor, action, trọng số điểm, ngưỡng kết cục | Dev, viết trong file JSON | Trước khi pilot, có thể tinh chỉnh qua các đợt thử |
| Nội dung 3 kết cục (thông báo, trạng thái hiển thị) | Dev, viết cố định trong JSON | Trước khi pilot, đã qua kiểm duyệt |
| Lời thoại NPC, tên miền hiển thị, nội dung tin nhắn | AI (Gemini), sinh động theo trigger event | Mỗi lần giáo viên khởi tạo scenario mới |
| Đánh giá free-text học sinh gõ | AI (Gemini), trả về điểm trong khoảng cố định | Mỗi lần học sinh gõ tin nhắn tự do |
| Phản hồi chuyên gia cuối scene | AI (Gemini), diễn giải log hành động | Mỗi lần scene kết thúc |

Nguyên tắc bao trùm: **AI không bao giờ sinh ra cấu trúc 3D, vị trí vật thể, hay nội dung kết cục mới. AI chỉ điền văn bản vào các trường đã được định nghĩa trước.**

### 1.2. Sơ đồ luồng dữ liệu

```
Giáo viên chọn scene_id có sẵn + nhập trigger_event
        │
        ▼
POST /api/scenarios/initialize
        │
        ├─ Backend đọc file scenes/{scene_id}.json
        ├─ Backend gom danh sách ai_fills cần điền
        ├─ Gọi Gemini, CHỈ yêu cầu điền đúng các trường đó
        └─ Trả về: session_id, model_path, spawn_point, anchor_contents
        │
        ▼
Frontend load file .glb (model_path), spawn học sinh tại spawn_point
        │
        ▼
Học sinh di chuyển, tương tác (proximity hoặc click/raycast)
        │
        ▼
POST /api/scenarios/action (mỗi lần có hành động)
        │
        ├─ Backend tra bảng action trong config JSON → score_delta cố định
        ├─ (Nếu free_text) gọi Gemini đánh giá, giới hạn cứng -3..+3
        ├─ Cập nhật risk_score, kiểm tra ngưỡng kết cục
        └─ Trả về: risk_score mới, npc_reply (nếu có), ending (nếu đạt ngưỡng)
        │
        ▼
Khi ending được kích hoạt → hiển thị nội dung CỐ ĐỊNH từ config JSON
        │
        ▼
POST /api/scenarios/feedback
        │
        └─ Gemini diễn giải log hành động thành lời khuyên cá nhân hóa
```

---

## 2. Cấu trúc dự án

```
project/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── scenes/
│       ├── gaming_lobby_v1.json
│       ├── search_results_v1.json
│       ├── group_chat_v1.json
│       └── ingame_store_v1.json
│
├── frontend/
│   ├── src/
│   │   ├── SceneRunner.jsx
│   │   ├── TeacherStudio.jsx
│   │   └── App.jsx
│   └── assets/
│       └── scenes/
│           ├── gaming_lobby.glb
│           ├── search_results.glb
│           ├── group_chat.glb
│           └── ingame_store.glb
│
└── README.md
```

---

## 3. Schema file cấu hình scene (JSON)

Mỗi scene là một file JSON độc lập, tuân theo schema thống nhất dưới đây. File `scenes/gaming_lobby_v1.json` (đính kèm) là bản mẫu đầy đủ, dùng làm khuôn để viết 3 file còn lại.

### 3.1. Các trường bắt buộc ở cấp scene

| Trường | Kiểu | Mô tả |
|---|---|---|
| `scene_id` | string | Định danh duy nhất, khớp tên file |
| `primary_risk` | string | Một trong: `content`, `contact`, `conduct`, `commerce` |
| `secondary_risk` | string hoặc null | Loại rủi ro leo thang, nếu có |
| `model_path` | string | Đường dẫn tới file `.glb` |
| `spawn_point` | [x, y, z] | Vị trí camera khi vào scene |
| `time_limit_seconds` | number | Thời gian tối đa cho một lượt chơi |
| `risk_thresholds` | object | Ba ngưỡng: `high`, `medium_sustained`, `safe_max_at_timeout` |
| `anchors` | array | Danh sách điểm tương tác |
| `endings` | object | Ba kết cục cố định: `trapped`, `escaped_unaware`, `safe_active` |

### 3.2. Cấu trúc một anchor

```json
{
  "anchor_id": "định danh duy nhất trong scene",
  "type": "npc_dialogue | interactive_screen | ui_panel | safety_assessment_panel",
  "position": [x, y, z],
  "model_ref": "tên object trong file .glb (nếu type cần model riêng)",
  "trigger_condition": "điều kiện kích hoạt tự động, ví dụ proximity",
  "unlock_condition": "điều kiện để anchor xuất hiện (dùng cho anchor leo thang)",
  "ai_fills": ["danh sách tên trường AI cần điền nội dung"],
  "curriculum_reference": "chỉ có ở anchor loại safety_assessment_panel",
  "actions": [ /* xem 3.3 */ ]
}
```

### 3.3. Cấu trúc một action trong anchor

```json
{
  "action_id": "định danh duy nhất trong anchor",
  "label_internal": "mô tả cho dev, KHÔNG hiển thị cho học sinh dạng menu",
  "category": "explore | comply_immediately | leave_or_report",
  "score_delta": số cố định,
  "input_type": "free_text (chỉ khi cần AI đánh giá nội dung học sinh gõ)",
  "ai_evaluates": true/false,
  "force_ending": "tên ending, nếu action này luôn kích hoạt kết thúc ngay"
}
```

**Lưu ý triển khai quan trọng**: trường `label_internal` tuyệt đối không được hiển thị dưới dạng nút bấm/menu cho học sinh. Nó chỉ là ghi chú nội bộ giúp dev biết action này tương ứng hành vi vật lý nào (ví dụ gắn vào vật thể 3D cụ thể qua `userData` trong file `.glb`, xem mục 5).

### 3.4. Cấu trúc `endings`

```json
{
  "trapped": {
    "condition": "mô tả điều kiện (tham khảo, logic thật nằm trong backend)",
    "fixed_content": {
      "screen_message": "nội dung đã duyệt trước, không đổi",
      "visual_state": "tên trạng thái hiển thị, frontend map sang hiệu ứng cụ thể"
    }
  },
  "escaped_unaware": { ... },
  "safe_active": { ... }
}
```

---

## 4. Backend (FastAPI)

### 4.1. Ba endpoint chính

| Endpoint | Method | Vai trò |
|---|---|---|
| `/api/scenarios/initialize` | POST | Giáo viên chọn scene + nhập trigger event, tạo session, AI điền `ai_fills` |
| `/api/scenarios/action` | POST | Học sinh thực hiện hành động, backend tính risk_score, kiểm tra ngưỡng |
| `/api/scenarios/feedback` | POST | Sau khi scene kết thúc, AI diễn giải log hành động thành lời khuyên |

Chi tiết implementation đầy đủ nằm trong file `backend/main.py` đính kèm. Các điểm cần lưu ý khi đọc/mở rộng code:

- **Session lưu trong bộ nhớ (`sessions: Dict`)**: đủ dùng cho quy mô 1 lớp học pilot. Nếu mở rộng nhiều lớp chạy song song hoặc cần lưu lại sau khi restart server, cần thay bằng Redis hoặc database nhẹ (SQLite đủ dùng).
- **`_check_thresholds`**: hàm kiểm tra ngưỡng kết cục, chạy sau mỗi action. Cửa sổ "sustained" (risk_score đứng yên ở mức trung bình đủ lâu) được kiểm tra bằng cách lọc `score_history` theo mốc thời gian, không cần thư viện ngoài.
- **`_evaluate_free_text`**: giới hạn cứng khoảng điểm AI trả về (`-3` đến `3`) bằng `max(-3, min(3, ...))` ngay trong code, không tin tưởng hoàn toàn giá trị AI trả về — đây là lớp phòng vệ bắt buộc để đảm bảo công bằng giữa các học sinh, tránh AI cho điểm lệch chuẩn giữa các lượt gọi khác nhau.
- **Fail-safe khi AI lỗi**: nếu gọi Gemini thất bại (timeout, lỗi định dạng JSON), trả về `score_delta = 0` thay vì chặn luồng chơi của học sinh — không để lỗi AI làm gián đoạn giờ học.

### 4.2. Lớp kiểm duyệt nội dung (bổ sung cần thiết, chưa có trong bản `main.py` mẫu)

Trước khi triển khai thật, cần bổ sung một bước kiểm duyệt cho hai điểm nhận input tự do từ học sinh:

1. Trong `_evaluate_free_text`: nếu nội dung học sinh gõ chứa thông tin định danh thật (tên, số điện thoại, địa chỉ) hoặc ngôn ngữ không phù hợp, hệ thống phải **không** đưa nội dung đó cho AI xử lý tiếp tục như bình thường, mà trả về phản hồi trung tính và ghi log riêng để giáo viên xem lại (đã có gợi ý logic này trong prompt của `_evaluate_free_text`, nhưng cần thêm một lớp kiểm tra bằng rule-based/regex đơn giản ở phía backend trước khi gọi AI, không chỉ dựa vào AI tự nhận biết).
2. Toàn bộ nội dung AI sinh ra (`opening_line`, `escalation_line`, `npc_reply`) nên đi qua một bước kiểm tra từ khóa cấm (danh sách từ khóa bạo lực/tình dục hóa/thông tin nhạy cảm) trước khi trả về frontend, tương tự lớp "Vision Moderation Layer" đã thiết kế ở bản prototype đầu tiên, nhưng áp dụng cho văn bản thay vì hình ảnh.

### 4.3. requirements.txt

```
fastapi
uvicorn
pydantic
google-genai
```

---

## 5. Frontend (React Three Fiber)

### 5.1. Stack công nghệ

| Thành phần | Công nghệ | Lý do chọn |
|---|---|---|
| Render 3D | `@react-three/fiber` | Nhẹ, chạy trực tiếp trình duyệt, không cần cài đặt |
| Điều khiển camera | `@react-three/drei` (`PointerLockControls`) | WASD + chuột có sẵn, không cần viết từ đầu |
| Model 3D | `.glb`/`.gltf`, low-poly | Nhẹ, load nhanh, phù hợp máy tính trường học cấu hình thấp |
| Overlay UI (hội thoại, kết cục) | `@react-three/drei` (`Html`) hoặc HTML/CSS thường phủ lên canvas | Không cần dựng UI bằng 3D |

Không dùng game engine nặng (Unity/Unreal) cho pilot — tốn thời gian build/export WebGL, khó chỉnh sửa nhanh trong giai đoạn thử nghiệm.

### 5.2. Hai cơ chế kích hoạt action

Component `SceneRunner.jsx` (đính kèm) xử lý hai loại hành động vật lý khác nhau:

**a) Proximity action** — tự động kích hoạt theo khoảng cách, không cần học sinh bấm gì:

```javascript
// Vật thể 3D cần gán userData khi dựng model:
// userData = { anchorId: "npc_stranger", proximityActionId: "observe_before_approach" }
```

Dùng cho các action loại "thăm dò tự nhiên" (đứng quan sát, lại gần chậm).

**b) Click/raycast action** — học sinh chủ động nhắm (crosshair giữa màn hình) và click chuột:

```javascript
// Vật thể 3D cần gán userData:
// userData = { anchorId: "npc_stranger", actionId: "open_report_panel" }
```

Dùng cho các action đòi hỏi quyết định rõ ràng (bấm nút báo cáo, click vào link).

**Điểm mấu chốt cần dev nắm rõ khi dựng model 3D**: mỗi vật thể có action gắn với nó phải được gán `userData` tương ứng ngay trong Blender (dùng Custom Properties) trước khi export `.glb`, để khi Three.js load model lên, `userData` vẫn giữ nguyên và code raycasting đọc được.

### 5.3. Free-text input

Với action có `input_type: "free_text"` (ví dụ gõ tin nhắn cho NPC), cần thêm một ô nhập liệu HTML overlay (dùng `Html` từ `drei`), xuất hiện khi học sinh ở gần anchor tương ứng. Component mẫu trong `SceneRunner.jsx` hiện đang xử lý phần proximity và click; phần input overlay cho free_text cần bổ sung thêm khi implement Scene 1 và Scene 3 (hai scene có action free_text).

---

## 6. Trình tự triển khai đề xuất

Thứ tự dưới đây sắp xếp theo mức độ rủi ro kỹ thuật tăng dần, để phát hiện vấn đề kiến trúc sớm nhất có thể, tránh dồn hết rủi ro vào cuối:

1. **Viết xong 4 file scene config JSON trước tiên, không cần code.** Đây là lúc rà lại toàn bộ bảng hành động/điểm/kết cục — sửa trên JSON rẻ hơn nhiều so với sửa sau khi đã code xong.

2. **Dựng 1 file `.glb` placeholder đơn giản cho Scene 1** (vài khối hộp đại diện NPC, màn hình, nút báo cáo), gán `userData` đúng theo `action_id` đã định trong JSON.

3. **Chạy thử toàn bộ luồng của riêng Scene 1**: initialize → di chuyển lại gần NPC (proximity) → gõ tin nhắn tự do → click báo cáo (raycast) → nhận ending → xem feedback. Đây là vòng lặp nhỏ nhất xác nhận kiến trúc hoạt động đúng trước khi nhân bản.

4. **Bổ sung lớp kiểm duyệt nội dung** (mục 4.2) ngay sau khi Scene 1 chạy được luồng cơ bản, trước khi thử nghiệm với học sinh thật.

5. **Nhân bản cấu trúc cho Scene 2/3/4**: chỉ đổi nội dung JSON và model `.glb`, khung code backend/frontend không đổi.

6. **Thay placeholder hộp bằng asset thật ở bước cuối cùng.** Nguồn asset đề xuất: Kenney.nl (low-poly, CC0, phù hợp phong cách thân thiện trẻ em), Mixamo (animation nhân vật cơ bản), Poly Pizza (model bổ sung, CC0/CC-BY). Không nên đầu tư asset đẹp trước khi luồng logic đã ổn định, tránh mất công dựng lại nếu cấu trúc anchor cần sửa.

---

## 7. Giới hạn kỹ thuật của pilot (cần thống nhất trước để tránh kỳ vọng sai)

- Không có vật lý va chạm phức tạp (nhân vật không "đi xuyên tường" là điều cần cân nhắc thêm bằng `@react-three/rapier` nếu thấy cần thiết, nhưng không bắt buộc cho pilot).
- Session lưu trong bộ nhớ backend, mất dữ liệu nếu restart server giữa buổi học — cần lưu ý vận hành, không phải giới hạn thiết kế.
- Không có tính năng nhiều học sinh chơi đồng thời trong cùng một không gian (mỗi học sinh có session riêng độc lập) — đây là quyết định có chủ đích để giảm rủi ro kỹ thuật cho pilot đầu tiên, không phải thiếu sót.
- Text-to-3D theo thời gian thực (AI tự sinh mô hình 3D mới) không nằm trong phạm vi pilot này do chưa đủ khả thi về tốc độ/dung lượng để chạy trên máy tính trường học.
