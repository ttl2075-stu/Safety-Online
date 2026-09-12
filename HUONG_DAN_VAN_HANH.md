# 📋 HƯỚNG DẪN VẬN HÀNH BUỔI THỬ NGHIỆM (PILOT)
### Mô phỏng 3D An toàn mạng cho học sinh 10-12 tuổi (2 tiết học)

---

## 1. Mục tiêu buổi thực nghiệm
- Đo lường phản xạ tự nhiên của học sinh (nhận diện bốc đồng vs cảnh giác chủ động).
- Tạo trải nghiệm thực hành thay vì bài giảng lý thuyết thụ động.
- Phát hiện các điểm nhạy cảm về nhận thức để giáo viên giải thích trong phần Debriefing cuối giờ.

---

## 2. Chuẩn bị kỹ thuật trước giờ học (Checklist 15 phút)

### Bước 1: Khởi động Backend
Tại máy chủ/máy giáo viên (hoặc từng máy phòng lab nếu chạy local):
`ash
cd e:\ProjectPyCharm\Safety-Online\backend
python -m uvicorn main:app --port 8000 --host 0.0.0.0
`
- Xác nhận: Mở trình duyệt truy cập http://localhost:8000/api/health trả về {"status": "ok"}.
- Kiểm tra file log: ackend/logs/audit_security.log sẵn sàng ghi nhận.

### Bước 2: Khởi động Frontend
`ash
cd e:\ProjectPyCharm\Safety-Online
npm run dev
`
- Mở liên kết hiển thị (thường là http://localhost:5173).

---

## 3. Kế hoạch tiến trình 2 tiết học (90 phút)

| Thời gian | Hoạt động | Nội dung & Vai trò của giáo viên |
|---|---|---|
| **00 - 10'** | Giới thiệu & Khởi động | - Nêu mục tiêu: 'Hôm nay chúng ta sẽ tham gia một cuộc thám hiểm mạng ảo.'<br>- Phát tờ hướng dẫn điều khiển 1 trang cho học sinh.<br>- Tuyệt đối **không mớm trước** mẹo tránh bẫy. |
| **10 - 35'** | Trải nghiệm Phân cảnh 1 & 2 | - **Cảnh 2 (Search results)** & **Cảnh 4 (In-game store)**: Tình huống đơn lớp, học sinh làm quen điều khiển.<br>- Giáo viên quan sát, ghi chú học sinh nào bị kẹt điều khiển chuột. |
| **35 - 60'** | Trải nghiệm Phân cảnh 3 & 4 | - **Cảnh 1 (Gaming lobby)**: Tương tác gõ tin nhắn tự do với NPC lạ.<br>- **Cảnh 3 (Group chat)**: Ứng xử trước áp lực đám đông.<br>- Học sinh thử nghiệm các hành vi khác nhau để xem kết cục. |
| **60 - 80'** | Thảo luận & Phân tích (Debriefing) | - Chiếu kết quả trên màn hình lớn.<br>- Mở file log kiểm toán xem có bao nhiêu lượt vô tình nhập số điện thoại/CCCD.<br>- Đặt câu hỏi kích thích: *'Tại sao khi người lạ hứa tặng đồ miễn phí, chúng ta lại dễ tin?'* |
| **80 - 90'** | Tổng kết & Thông điệp an toàn | - Khắc sâu quy tắc 3 KHÔNG và kỹ năng báo cáo.<br>- Học sinh điền phiếu đánh giá cảm nhận ngắn. |

---

## 4. Xử lý các tình huống phát sinh tại phòng máy

1. **Học sinh bảo 'Em không di chuyển được chuột'**:
   - Nhắc học sinh: Nhấp chuột trái vào giữa màn hình 3D để khóa camera. Nhấn phím ESC khi muốn mở chuột để gõ chữ hoặc chuyển cảnh.
2. **Học sinh gõ số điện thoại thật vào ô chat**:
   - Hệ thống sẽ tự động kích hoạt lớp kiểm duyệt regex, chặn câu nói và hiện cảnh báo: *"Cảnh báo an toàn: Bạn vừa nhập thông tin riêng tư..."*.
   - Giáo viên ghi nhận để nhắc nhở chung cả lớp ở phần Debriefing, không chỉ trích cá nhân em đó trước lớp.
3. **Mạng yếu hoặc không có kết nối LLM**:
   - Backend đã tích hợp sẵn cơ chế **Fallback Templates**: Tự động sinh hội thoại mẫu tiếng Việt và chấm điểm rule-based, đảm bảo buổi học diễn ra 100% trơn tru không phụ thuộc vào internet.
4. **Máy cấu hình yếu bị giật khung hình**:
   - Mô hình 3D được tối ưu bằng hình học cơ bản (Procedural Low-Poly Shapes) nên chạy mượt trên hầu hết các máy tính phòng lab đời cũ hỗ trợ WebGL.
