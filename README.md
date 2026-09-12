# Digital Safety Simulation - Mô phỏng 3D An Toàn Mạng Cho Học Sinh

Ứng dụng mô phỏng giáo dục an toàn mạng theo khung 4Cs (Contact, Content, Conduct, Commerce), thiết kế cho học sinh lứa tuổi 10-12 dựa trên nghiên cứu nhận thức và tài liệu của UNICEF.

---

## 📁 Cấu trúc thư mục dự án

```
Safety-Online/
├── backend/
│   ├── main.py                  # FastAPI server hỗ trợ OpenAI pattern
│   ├── moderation.py            # Lớp kiểm duyệt nội dung PII (SĐT, CCCD, Email)
│   ├── fallback_templates.py    # Kịch bản dự phòng khi AI không khả dụng
│   ├── test_suite.py            # Bộ kiểm thử tự động cho toàn bộ hệ thống
│   ├── requirements.txt         # Thư viện Python
│   ├── .env.example             # Mẫu cấu hình API key
│   ├── logs/
│   │   └── audit_security.log   # Nhật ký kiểm toán vi phạm PII của học sinh
│   └── scenes/                  # 4 phân cảnh kịch bản JSON
│       ├── gaming_lobby_v1.json (Contact)
│       ├── search_results_v1.json (Content)
│       ├── group_chat_v1.json (Conduct)
│       └── ingame_store_v1.json (Commerce)
│
├── src/
│   ├── App.jsx                  # Điều phối màn hình, Risk HUD, Free-text chat
│   ├── SceneStage.jsx           # Không gian 3D R3F, Crosshair, Raycast hitbox, WASD controls
│   └── main.jsx                 # Entrypoint React 18
│
├── index.html                   # HTML template
├── package.json                 # Cấu hình Vite & Three.js
├── HUONG_DAN_HOC_SINH.md        # Tờ hướng dẫn 1 trang cho học sinh
└── HUONG_DAN_VAN_HANH.md        # Cẩm nang 2 tiết học cho giáo viên
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Khởi chạy Backend

1. Cài đặt thư viện Python (khuyến khích dùng môi trường ảo):
```bash
pip install -r backend/requirements.txt
```

2. (Tùy chọn) Cấu hình API LLM:
Tạo file `backend/.env` (hoặc sao chép từ `backend/.env.example`):
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini
```
*Lưu ý: Nếu không cấu hình API key, hệ thống tự động kích hoạt chế độ **Fallback Rules & Templates** định sẵn, đảm bảo không bao giờ bị crash giữa giờ học.*

3. Khởi động server:
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
Kiểm tra tại trình duyệt: `http://localhost:8000/api/health`

### 2. Khởi chạy Frontend

Tại thư mục gốc dự án:
```bash
npm install
npm run dev
```
Mở trình duyệt tại đường dẫn Vite cung cấp (mặc định: `http://localhost:5173`).

---

## 🧪 Kiểm thử tự động (Automated Tests)

Chạy bộ test kiểm tra dữ liệu 4 scene, logic kiểm duyệt PII và các endpoint:
```bash
python backend/test_suite.py
```
