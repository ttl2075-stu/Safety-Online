# Các mẫu văn bản cố định chất lượng cao cho kịch bản khi AI không khả dụng hoặc dự phòng.
FALLBACK_OPENING_LINES = {
    "gaming_lobby_v1": [
        "Chào bạn, mình có dư khẩu súng VIP và skin huyền thoại hiếm lắm, bạn muốn nhận miễn phí không?",
        "Ê bạn ơi, mình thấy bạn chơi hay quá, kết bạn với mình đi rồi mình tặng 1000 Robux/vật phẩm nè!",
        "Bạn mới chơi à? Mình đang lập team săn boss, tặng bạn bộ giáp xịn nếu bạn trả lời tin nhắn của mình nhé!"
    ],
    "search_results_v1": [
        "Chúc mừng bạn là người may mắn thứ 1000! Bấm vào đây để nhận quà công nghệ miễn phí.",
        "Cảnh báo: Máy tính của bạn bị nhiễm 5 loại virus nguy hiểm! Bấm để quét ngay lập tức.",
        "Bí kíp tải game lậu bản quyền miễn phí 100% không cần tài khoản."
    ],
    "group_chat_v1": [
        "Ê mọi người xem tấm hình này của bạn Nam đi, nhìn buồn cười với ngố ghê chưa, ai có ảnh dìm nữa đăng lên đi!",
        "Lan ơi hôm qua thấy bạn chụp ảnh bạn Hùng bị ngã, share vào nhóm cho cả lớp cùng xem đi!",
        "Ai không chia sẻ link này sẽ bị kích khỏi nhóm chat lớp nhé!"
    ],
    "ingame_store_v1": [
        "Ưu đãi đặc biệt: Nạp 50k nhận 1.000.000 KC! Nhập mã OTP và số thẻ cào ngay bây giờ.",
        "Sự kiện tri ân: Vòng quay may mắn trúng 100% iPhone 15 Pro, chỉ cần quét mã QR.",
        "Cảnh báo tài khoản của bạn sắp bị khóa nếu không xác minh thẻ thanh toán trong 5 phút."
    ]
}

def get_fallback_opening(scene_id: str) -> str:
    lines = FALLBACK_OPENING_LINES.get(scene_id)
    if lines:
        return lines[0]
    return "Xin chào, bạn có muốn trao đổi vật phẩm không?"

def evaluate_fallback_free_text(text: str) -> tuple[float, str]:
    """
    Đánh giá rule-based đơn giản khi LLM không khả dụng:
    - Nếu đồng ý, vâng, ok, đưa tên, gửi link -> bốc đồng (+1.5 đến +2.5)
    - Nếu từ chối, không, nghi ngờ, hỏi bạn là ai, báo cô giáo -> cẩn trọng (-2.0 đến -3.0)
    - Trung tính -> 0.0
    """
    lower = text.lower()
    caution_keywords = ["không", "tại sao", "bạn là ai", "lừa đảo", "báo cáo", "cô giáo", "thầy", "bố mẹ", "không cần", "kệ", "sợ", "virus"]
    impulsive_keywords = ["cho mình xin", "vâng", "ok", "được", "gửi đi", "tên tôi là", "mật khẩu", "sđt", "kết bạn nha", "lấy", "thích thế"]

    caution_score = sum(1 for kw in caution_keywords if kw in lower)
    impulsive_score = sum(1 for kw in impulsive_keywords if kw in lower)

    if caution_score > impulsive_score:
        return -2.0, "Ủa sao bạn cảnh giác quá vậy? Thôi nếu bạn không tin thì mình tìm người khác vậy!"
    elif impulsive_score > caution_score:
        return 2.5, "Tuyệt vời! Vậy bạn gửi tên tài khoản và kết bạn để mình chuyển quà ngay nhé!"
    else:
        return 0.0, "Bạn có đang nghe mình nói không? Muốn nhận quà thì trả lời rõ ràng nha!"
