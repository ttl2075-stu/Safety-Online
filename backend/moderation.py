import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
AUDIT_LOG_FILE = LOG_DIR / "audit_security.log"

# Các biểu thức chính quy phát hiện dữ liệu nhạy cảm / PII
PATTERNS = {
    "phone_vn": (
        r'(?:\+?84|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}\b',
        "Số điện thoại di động Việt Nam"
    ),
    "generic_long_digits": (
        r'\b\d{9,12}\b',
        "Dãy số dài bất thường (CCCD, CMND hoặc mã bí mật)"
    ),
    "email": (
        r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+',
        "Địa chỉ Email cá nhân"
    ),
    "suspicious_links": (
        r'(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|net|xyz|vip|cc|top|info)[/\w-]*)',
        "Liên kết hoặc địa chỉ trang web bên ngoài"
    ),
}

def mask_text(text: str) -> str:
    """Che bớt nội dung nhạy cảm trước khi ghi log kiểm toán để bảo vệ dữ liệu."""
    if len(text) <= 4:
        return "****"
    return text[:2] + "*" * (len(text) - 4) + text[-2:]

def check_sensitive_content(text: str, session_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Kiểm tra xem chuỗi văn bản học sinh nhập vào có chứa thông tin nhạy cảm không.
    Trả về dict gồm:
    - is_sensitive: bool
    - reason: str hoặc None
    - warning_reply: câu nhắc nhở phù hợp lứa tuổi 10-12
    """
    if not text:
        return {"is_sensitive": False, "reason": None, "warning_reply": None}

    cleaned = text.strip()

    for pattern_name, (regex, desc) in PATTERNS.items():
        match = re.search(regex, cleaned, flags=re.IGNORECASE)
        if match:
            matched_val = match.group(0)
            reason = desc
            warning_reply = (
                "⚠️ Cảnh báo an toàn: Bạn vừa nhập thông tin riêng tư (số điện thoại, CCCD hoặc email). "
                "Tuyệt đối không gửi thông tin này cho người lạ trên mạng!"
            )
            
            # Ghi log kiểm toán cho giáo viên
            _log_audit_event(session_id or "unknown", reason, matched_val, cleaned)

            return {
                "is_sensitive": True,
                "reason": reason,
                "warning_reply": warning_reply,
            }

    return {"is_sensitive": False, "reason": None, "warning_reply": None}

def _log_audit_event(session_id: str, reason: str, matched_val: str, full_text: str):
    """Ghi lại lịch sử vi phạm để giáo viên/chuyên gia xem xét sau buổi học."""
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = (
        f"[{now_str}] [SESSION: {session_id}] [REASON: {reason}] "
        f"PII: {mask_text(matched_val)} | Input snippet: {full_text[:80]}\n"
    )
    try:
        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_line)
    except Exception as e:
        print(f"Lỗi ghi log bảo mật: {e}")
