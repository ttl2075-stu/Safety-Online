# Tài liệu mô tả kịch bản
## Ứng dụng mô phỏng 3D nhập vai an toàn mạng cho học sinh

---

## 1. Bối cảnh và mục tiêu

### 1.1. Vấn đề xuất phát

Học sinh ở giai đoạn phát triển nhận thức chưa hoàn thiện, chưa đủ khả năng nhận diện ý đồ lừa đảo hay phán đoán tình huống nguy hiểm khi tham gia môi trường trực tuyến. Không thể cấm học sinh sử dụng internet, và việc dạy an toàn mạng bằng lý thuyết suông hoặc áp đặt chỉ gây phản tác dụng, khiến học sinh chống đối.

### 1.2. Định vị sản phẩm

Ứng dụng giáo dục an toàn mạng trải nghiệm, nơi học sinh tự hành động trong một không gian 3D mô phỏng tình huống trực tuyến có rủi ro, quan sát hệ quả từ chính hành vi của mình, và nhận phản hồi cá nhân hóa từ giáo viên/chuyên gia.

Theo khung phản ứng bốn trụ cột của UNICEF (Child Safety Online: Global Challenges and Strategies), sản phẩm phục vụ trụ cột thứ nhất: **trao quyền và xây dựng khả năng phục hồi cho trẻ (empowering children and enhancing resilience to harm)**. Sản phẩm không thay thế cơ chế báo cáo/can thiệp chuyên nghiệp, không phục vụ ba trụ cột còn lại (loại bỏ miễn trừ cho kẻ lạm dụng, giảm khả năng tiếp cận nội dung có hại, hỗ trợ phục hồi cho trẻ đã bị tổn hại).

### 1.3. Đối tượng thử nghiệm (pilot)

- Quy mô: 1 lớp học, khoảng 25-30 học sinh
- Độ tuổi: 10-12 tuổi (giai đoạn "Late childhood" theo phân loại phát triển nhận thức trong tài liệu curriculum)
- Thời lượng: 2 tiết học

### 1.4. Căn cứ chọn nhóm tuổi 10-12

Tài liệu curriculum của nhà trường (The Child in Online Environment) mô tả đặc điểm nhận thức của nhóm tuổi này:

- Có khả năng nhận biết tình huống nguy hiểm dần hoàn thiện về cuối giai đoạn, nhưng đầu giai đoạn vẫn dễ bị thao túng, chưa thể xác định ý định của người khác
- Chưa có khả năng cân nhắc rằng một người có thể có hồ sơ trực tuyến giả
- Kiểm soát xung động (impulse control) còn khó khăn, khiến nội dung được đề xuất/gợi ý có sức ảnh hưởng đặc biệt mạnh và khó cưỡng lại

Đây chính là lý do thiết kế sản phẩm ưu tiên **đo hành vi chủ động và phản xạ bốc đồng**, thay vì chỉ đo khả năng chọn đáp án đúng khi được nhắc.

---

## 2. Nền tảng lý luận

### 2.1. Khung phân loại rủi ro: 4Cs of Online Safety

Theo tài liệu curriculum của nhà trường, rủi ro trực tuyến được phân thành 4 loại:

| Loại | Định nghĩa | Ví dụ |
|---|---|---|
| **Content** | Trẻ tiếp nhận thụ động nội dung có hại | Khiêu dâm, tin giả, phát ngôn thù ghét, nội dung cực đoan hóa |
| **Contact** | Trẻ bị nhắm đến như đối tượng tương tác bởi người khác | Kết bạn rủi ro với người lạ, dụ dỗ, lừa đảo |
| **Conduct** | Trẻ chủ động khởi xướng hành vi rủi ro | Bắt nạt qua mạng, chia sẻ/nhận ảnh nhạy cảm |
| **Commerce** | Hoạt động tài chính trực tuyến rủi ro | Cờ bạc, quảng cáo sai lệch, lừa đảo, phishing |

**Lưu ý quan trọng đã được tài liệu curriculum chỉ rõ**: bốn loại này **chồng lấn nhau trong thực tế**. Ví dụ được tài liệu đưa ra: kết bạn với người lạ trên game (Contact) có thể dẫn đến chia sẻ ảnh nhạy cảm (Conduct) và tiếp xúc nội dung khiêu dâm (Content). Vì lý do này, hai trong bốn phân cảnh của sản phẩm được thiết kế theo cơ chế **leo thang giữa hai loại C**, không dừng ở một loại rủi ro đơn lẻ.

### 2.2. Nguyên tắc "risk khác harm"

Tài liệu tham khảo UNICEF nhấn mạnh: không phải mọi rủi ro đều dẫn đến tổn hại; ranh giới giữa lợi ích và rủi ro trên Internet không rõ ràng. Vì vậy, hệ thống đánh giá của sản phẩm dùng thang 3 mức kết cục (xem mục 4), không dùng thang nhị phân an toàn/không an toàn.

### 2.3. Nguyên tắc thiết kế trải nghiệm: vì sao không dùng cơ chế trắc nghiệm

Quyết định thiết kế quan trọng nhất của dự án: **không cho học sinh chọn giữa các đáp án có sẵn dạng nút bấm**. Lý do:

1. Ngoài đời, trẻ bị dụ dỗ không đứng trước các lựa chọn rõ ràng có nhãn "cảnh giác/tin tưởng/bỏ qua" — bản thân việc liệt kê lựa chọn đã ngầm giải sẵn bài toán thay học sinh.
2. Cơ chế trắc nghiệm đo được khả năng chọn đúng khi được nhắc, nhưng không đo được khả năng tự phát hiện khi không được nhắc — đây mới là năng lực cốt lõi cần xây dựng.
3. Tài liệu curriculum nhấn mạnh: "tín hiệu cảnh báo tồn tại rõ ràng trong đời thực (ngôn ngữ cơ thể, khoảng cách) lại gần như vắng bóng trên môi trường mạng." Sản phẩm cần buộc học sinh **tự quan sát và phát hiện** dấu hiệu cảnh báo bằng hành động vật lý trong không gian 3D, không phải đọc từ văn bản lựa chọn.

Thay vào đó, sản phẩm dùng cơ chế **risk_score tích lũy theo hành động vật lý thực tế** (mô tả chi tiết ở mục 4), phản ánh đúng bản chất tài liệu mô tả về grooming: "diễn ra theo tiến trình cyclical (adoption, maintenance, relapse, readoption), không phải một khoảnh khắc quyết định duy nhất."

---

## 3. Danh sách bốn phân cảnh (scenes)

| # | Tên phân cảnh | Bối cảnh nền tảng | Loại rủi ro chính | Loại rủi ro leo thang |
|---|---|---|---|---|
| 1 | Sảnh chờ trò chơi (Gaming lobby) | Game online kiểu Roblox | Contact | → Conduct |
| 2 | Trang kết quả tìm kiếm (Search results) | Công cụ tìm kiếm/trang tin | Content | — |
| 3 | Nhóm chat lớp (Group chat) | Ứng dụng nhắn tin | Conduct | → Contact (áp lực bạn bè) |
| 4 | Cửa hàng vật phẩm trong game (In-game store) | Mua sắm/vật phẩm ảo | Commerce | — |

### Nguyên tắc chọn thứ tự

Phân cảnh 2 và 4 là rủi ro đơn lớp, phù hợp làm bài mở đầu dễ tiếp cận. Phân cảnh 1 và 3 có hai lớp anchor nối tiếp (rủi ro chính rồi leo thang sang loại C khác), nên đưa vào sau khi học sinh đã quen với cơ chế tương tác.

---

## 4. Cơ chế trải nghiệm chi tiết

### 4.1. Nguyên tắc chung: hành động vật lý thay cho lựa chọn văn bản

Học sinh điều khiển nhân vật di chuyển trong không gian 3D cố định (dựng sẵn, không sinh động), quan sát, tiếp cận, và tương tác trực tiếp với vật thể (NPC, màn hình giả, nút báo cáo, ô chat) — không có menu lựa chọn hiện sẵn.

Ba loại hành động vật lý dùng chung nguyên tắc trên cả 4 scene:

| Loại hành động | Ý nghĩa sư phạm | Tác động risk_score |
|---|---|---|
| **Thăm dò** (quan sát, lại gần chậm, đọc kỹ trước khi hành động, đối chiếu nguồn) | Phản ánh sự cảnh giác chủ động | Trừ điểm |
| **Tuân theo ngay** (click link ngay, đồng ý ngay, cung cấp thông tin ngay) | Phản ánh phản xạ bốc đồng, thiếu kiểm soát xung động | Cộng điểm mạnh |
| **Rời đi/báo cáo** (dùng công cụ báo cáo, rời khỏi tình huống, an ủi nạn nhân) | Phản ánh kỹ năng thoát khỏi tình huống rủi ro | Trừ điểm mạnh, có thể kích hoạt kết cục an toàn ngay |

### 4.2. Ba ngưỡng kết cục (kết hợp rẽ nhánh cố định + đánh giá tích lũy)

Cơ chế "B+C": **thời điểm** kết thúc do risk_score tích lũy quyết định (không cố định trước một kịch bản duy nhất), nhưng **nội dung** kết thúc lấy từ một tập hữu hạn đã viết và duyệt trước (không để AI tự sinh nội dung mới tại thời điểm kết thúc).

| Ngưỡng | Điều kiện | Kết cục |
|---|---|---|
| Cao | risk_score ≥ 7 | **Rơi vào bẫy** |
| Trung bình kéo dài | risk_score giữ 3-6 điểm liên tục quá 90 giây | **Thoát ra nhưng chưa cảnh giác hoàn toàn** |
| Chủ động/hết giờ với điểm thấp | risk_score ≤ 2 khi hết thời gian, hoặc hành động báo cáo/rời đi được kích hoạt | **Xử lý an toàn, chủ động** |

### 4.3. Vì sao cách này "thực tế" hơn trắc nghiệm

- Việc không hành động (đứng yên quan sát) cũng là một hành động có ý nghĩa sư phạm, được ghi nhận tự động theo khoảng cách, không cần học sinh bấm gì.
- Tốc độ và trình tự hành động trở thành dữ liệu: học sinh click ngay vào link trong 2 giây khác về bản chất so với học sinh quan sát kỹ trước khi quyết định, dù kết quả hành động cuối giống nhau.
- Nhiều hành động nhỏ tích lũy dần phản ánh đúng tiến trình grooming/lừa đảo thực tế, không phải một quyết định duy nhất.

---

## 5. Mô tả chi tiết từng phân cảnh

### Scene 1: Sảnh chờ trò chơi (Contact → Conduct)

**Trigger event mẫu**: Người chơi lạ đề nghị tặng vật phẩm/tiền ảo miễn phí, sau đó dụ chuyển sang chat riêng và xin thông tin cá nhân.

**Anchor 1.1 — `npc_stranger`**: NPC dùng kỹ thuật dụ dỗ "tâng bốc" (flattery) và "đóng vai người hướng dẫn" (mentor) — đúng thuật ngữ trong nghiên cứu European Online Grooming Project được trích trong tài liệu curriculum. Dấu hiệu cảnh báo cài sẵn: NPC tiếp cận và bắt chuyện ngay khi học sinh vừa xuất hiện, lời khen tâng bốc thái quá ngay từ câu đầu.

**Anchor 1.2 — `escalation_point`** (mở khi đã tương tác thân thiện ở 1.1): Mô phỏng bước leo thang "chuyển kênh liên lạc" (từ chat công khai sang riêng tư) mà tài liệu mô tả là đặc trưng của quá trình grooming. Dừng ở mức xin thông tin trường học/lớp, không mô phỏng yêu cầu nội dung nhạy cảm.

**Kết cục Rơi vào bẫy**: Thông báo tài khoản bị đổi thông tin đăng nhập.
**Kết cục Thoát chưa cảnh giác**: NPC rời đi sau im lặng kéo dài, không có hệ quả rõ ràng.
**Kết cục An toàn chủ động**: Báo cáo được ghi nhận, NPC bị ẩn khỏi lobby.

**Neo curriculum**: "Online relationships — what 'knowing' someone online means"; "Personal information and privacy".

---

### Scene 2: Trang kết quả tìm kiếm (Content)

**Trigger event mẫu**: Học sinh tìm thông tin làm bài tập, gặp bài viết tiêu đề giật gân, nguồn không rõ ràng.

**Anchor 2.1 — `search_results_screen`**: Danh sách kết quả tìm kiếm giả, trong đó có 1-2 kết quả mang dấu hiệu content risk (tiêu đề giật gân, tên miền lạ, không có tác giả). Mức độ nội dung mô phỏng dừng ở tin giả/tin gây hoang mang, không mô phỏng nội dung khiêu dâm hay tự hại thực tế.

**Anchor 2.2 — `click_consequence`**: Hậu quả là tiếp xúc nội dung sai lệch, không phải bị nhiễm mã độc (tách bạch với rủi ro Commerce ở Scene 4).

**Kết cục Rơi vào bẫy**: Thông báo đã chia sẻ thông tin sai lệch cho 20 người bạn khác.
**Kết cục Thoát chưa cảnh giác**: Đọc xong nội dung sai lệch nhưng không chia sẻ tiếp, cũng không đối chiếu nguồn nào.
**Kết cục An toàn chủ động**: Đối chiếu được với nguồn đáng tin cố định trong scene.

**Neo curriculum**: "Digital media literacy — how to identify fake news, how to identify trustworthy sources".

---

### Scene 3: Nhóm chat lớp (Conduct → Contact/áp lực bạn bè)

**Trigger event mẫu**: Một bạn gửi ảnh chế giễu bạn khác trong nhóm chat lớp, rủ mọi người cùng chia sẻ tiếp.

**Anchor 3.1 — `chat_window`**: Mô phỏng đúng đặc điểm cyberbullying mà tài liệu mô tả: "unrelenting nature... social media is always on." Dấu hiệu cảnh báo: tốc độ tin nhắn dồn dập ngay sau khi nội dung chế giễu xuất hiện.

**Anchor 3.2 — `peer_pressure_point`**: Nhiều avatar bạn bè cùng lúc thúc giục chia sẻ tiếp, mô phỏng áp lực số đông — phù hợp đặc điểm tâm lý tuổi này ("search for social stature within the peer group" theo tài liệu curriculum).

**Kết cục Rơi vào bẫy**: Thông báo bạn bị chế giễu đã rời khỏi nhóm chat.
**Kết cục Thoát chưa cảnh giác**: Không tham gia chế giễu nhưng cũng không hành động giúp bạn.
**Kết cục An toàn chủ động**: Bạn bị chế giễu phản hồi cảm ơn, báo cáo được ghi nhận.

**Neo curriculum**: "Online behaviour — noticing feelings, practising empathy"; "Impact of cyberbullying".

---

### Scene 4: Cửa hàng vật phẩm trong game (Commerce)

**Trigger event mẫu**: Quảng cáo tặng vật phẩm hiếm nếu nhập thông tin thẻ ngân hàng của phụ huynh, hoặc giá rẻ bất thường kèm đồng hồ đếm ngược.

**Anchor 4.1 — `store_display`**: Dấu hiệu cảnh báo cài sẵn: đồng hồ đếm ngược tạo cấp bách, giá rẻ bất thường so với giá trị thị trường trong game.

**Anchor 4.2 — `payment_prompt`**: Yêu cầu thông tin thẻ ngân hàng để "xác minh" — chỉ hiện dòng chữ yêu cầu, không mô phỏng giao diện nhập số thẻ thật, tránh dạy cách nhập liệu thật.

**Kết cục Rơi vào bẫy**: Thông báo giao dịch không thành công, thông tin đã bị gửi đi.
**Kết cục Thoát chưa cảnh giác**: Không mua nhưng cũng không hiểu vì sao giá đó bất thường.
**Kết cục An toàn chủ động**: Dùng công cụ so sánh giá, nhận diện được chiêu trò quảng cáo.

**Neo curriculum**: "Managing online information — understanding influence, persuasion and manipulation... advertising".

---

## 6. Chỉ số đánh giá pilot

- Tỷ lệ học sinh phân loại đúng loại rủi ro (Content/Contact/Conduct/Commerce) của tình huống mình vừa trải qua, so sánh trước/sau buổi học
- Mức độ tự tin khi tự đánh giá tình huống (đối chiếu phát hiện của UNICEF: trẻ thường đánh giá thấp rủi ro của chính mình so với người khác)
- Phân bố kết cục đạt được của cả lớp theo từng scene (bao nhiêu % rơi bẫy/thoát chưa cảnh giác/an toàn chủ động) — dùng để đánh giá độ khó của scene có phù hợp không
- Ghi nhận định tính: học sinh có tự đề xuất giả thuyết/hành động ngoài các anchor mẫu không (đo tính chủ động khám phá)

---

## 7. Giới hạn nội dung an toàn (áp dụng xuyên suốt mọi scene)

- Không có khuôn mặt người thật hoặc hiện thực trong bất kỳ NPC nào
- Không mô phỏng nội dung tình dục hóa, chỉ dừng ở giai đoạn "Scanning" và "Style" của grooming (tâng bốc, đóng vai mentor), không mô phỏng giai đoạn "Intensity" (theo phân loại European Online Grooming Project)
- Không mô phỏng quy trình nhập liệu thẻ ngân hàng thật, chỉ mô tả bằng văn bản yêu cầu
- Mọi nội dung do AI sinh (lời NPC, tin nhắn, phản hồi tự do của học sinh) đều đi qua lớp kiểm duyệt trước khi hiển thị (xem tài liệu thiết kế kỹ thuật, mục kiểm duyệt)
