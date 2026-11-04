# CHỢ CÓC ONLINE — GAME DESIGN DOCUMENT (GDD v0.1)

> **Dành cho:** Chủ dự án, Game Designer và Codex / AI coding agent.  
> **Trạng thái:** BẢN ĐỊNH HƯỚNG THIẾT KẾ SAU BETA — **CHƯA PHẢI LỆNH TRIỂN KHAI TOÀN BỘ**.  
> **Ngày lập:** 2026-11-04.  
> **Căn cứ hiện trạng:** `BAN_GIAO_CO_CHE_VA_PLAYTEST(1).md` do chủ dự án cung cấp.  
> **Thư mục dự án trên máy chủ sở hữu:** `C:\Users\nghia\ao\projects\ChoCocOnline` (độc lập với GameCatWeb).

---

## 0. QUY TẮC DÀNH CHO CODEX — ĐỌC TRƯỚC

1. **Đây là tài liệu thiết kế**, không phải yêu cầu tự động code mọi mục trong tài liệu. Khi chưa có nhiệm vụ cụ thể, hãy đọc, đối chiếu repository, chỉ ra khác biệt và đề xuất kế hoạch theo từng giai đoạn; **không tự ý thay đổi source code, database hay asset**.
2. Phân biệt ba nhãn:
   - **[BETA HIỆN CÓ]**: được ghi trong tài liệu bàn giao; vẫn phải kiểm tra mã nguồn trước khi sửa.
   - **[ĐỀ XUẤT]**: ý tưởng cần đặc tả, kiểm chứng và duyệt trước khi triển khai.
   - **[CHƯA CHỐT]**: tham số hoặc quyết định chưa được chủ dự án phê duyệt.
3. Không được kết luận rằng tính năng đã hoạt động chỉ vì được nhắc đến trong GDD. **Repository và test chạy thực tế là nguồn xác minh triển khai**, tài liệu bàn giao là mô tả ban đầu.
4. Ưu tiên an toàn tiền/hàng/tài khoản, đồng bộ multiplayer, dữ liệu cũ và hiệu năng trước hình ảnh, bản đồ hoặc mở rộng số lượng sản phẩm.
5. **Server là nguồn quyết định cuối** cho tiền, hàng, thuê sạp, giá, giao dịch, uy tín, thưởng và tiến trình. Client không được tự xác nhận thành công các thao tác kinh tế.
6. Không xóa hoặc đặt lại `data/market.sqlite` để giải quyết vấn đề migration. Không ghi đè database đang mở. Không commit database, token, khóa phiên hay dữ liệu nhạy cảm.
7. Mỗi chức năng mới phải có: mô tả gameplay, đầu vào/đầu ra, luật server, dữ liệu lưu, tương thích hồ sơ cũ, giao diện, kiểm thử happy path và edge case, cách rollback.
8. Không tự bật public tunnel, không triển khai production, không thay đổi chính sách thu phí hay làm mất tài sản người chơi khi chưa được yêu cầu.

## 1. TẦM NHÌN VÀ ĐỊNH VỊ

### 1.1. Tên & thể loại

- **Tên:** Chợ Cóc Online.
- **Thể loại:** Casual Social Business Simulation / Web multiplayer 3D.
- **Công nghệ hiện tại:** Node.js, WebSocket, Three.js, SQLite.
- **Nền tảng mục tiêu:** Trình duyệt trên PC và điện thoại.
- **Không gian:** Khu chợ Việt Nam, định hướng lấy cảm hứng từ chợ Bến Thành và hoạt động buôn bán vỉa hè Sài Gòn.
- **Cảm hứng:** Tinh thần gần gũi, vui vẻ và phát triển kinh doanh của game Hàng Rong thời Zing Me; **không sao chép nội dung, hình ảnh hoặc code của game cũ**.

### 1.2. Lời hứa trải nghiệm

> **“Từ một mẹt hàng nhỏ đến một cơ nghiệp giữa lòng Sài Gòn.”**

Người chơi khởi đầu là người bán hàng rong ít vốn ngoài vỉa hè; đi nhập hàng, bày hàng, định giá, trò chuyện và giao dịch; dần sở hữu xe đẩy, thuê quầy mái bạt, thuê gian trong chợ; xây dựng uy tín, thương hiệu, quan hệ với khách và tiểu thương.

### 1.3. Bốn trụ cột thiết kế

1. **Casual dễ chơi:** Vào game hiểu việc cần làm; có niềm vui trong phiên ngắn 5–10 phút; không nhồi nhiều bảng/công thức.
2. **Kinh doanh có chiều sâu:** Chọn mặt hàng, vốn, giá, thời điểm, vị trí, tồn kho, ngành nghề và hợp đồng tạo những đánh đổi có ý nghĩa.
3. **Chất Việt:** Gánh hàng, mẹt, xe bánh mì, xe nước mía, ghế nhựa, mái bạt, bảng hiệu, tiếng rao, chợ đêm, mặc cả.
4. **Cộng đồng sống động:** Người chơi nhìn thấy và tương tác với nhau, mua bán, giúp đỡ, cạnh tranh lành mạnh, tổ chức hoạt động chung.

### 1.4. Ranh giới thiết kế

- **Không** biến game thành trải nghiệm chỉ đứng chờ NPC 30 giây mua một lần.
- **Không** biến game thành mô phỏng kế toán quá khó, hay ép đăng nhập vì tiền thuê/vật phẩm tự mất khi offline.
- **Không** làm các nghề chỉ khác sprite/mô hình và giá niêm yết.
- **Không** để sạp cao cấp là đường đi duy nhất hoặc lựa chọn kinh tế tốt tuyệt đối.
- **Không** ưu tiên mở bản đồ lớn khi hiệu năng 6 người thật chưa đạt.

## 2. HIỆN TRẠNG BETA — THÔNG TIN CẦN BẢO TOÀN

> Các số liệu phần này lấy từ tài liệu bàn giao; không phải công thức cân bằng cuối cùng.

### 2.1. Kinh doanh [BETA HIỆN CÓ]

| Nội dung | Giá trị/mô tả |
| --- | --- |
| Vốn người chơi mới | 150 xu |
| Xoài | Vốn 8, giá tham khảo 15 |
| Bánh mì | Vốn 11, giá tham khảo 20 |
| Cà phê | Vốn 6, giá tham khảo 12 |
| Hoa | Vốn 14, giá tham khảo 25 |
| Mẹt | Chứa 10 món |
| Xe đẩy | Giá 100 xu, chứa 30 món |
| Sạp lớn | Giá 250 xu, chứa 80 món |
| Chỗ đặt sạp | 8 chỗ/khu |
| Người/khu | Cấu hình tối đa 60, **chưa được kiểm chứng trải nghiệm thực tế** |
| NPC mua | 1 món/sạp online mỗi 30 giây |
| Giá NPC chấp nhận | Hàng đang chuộng tối đa 1,5× giá tham khảo; còn lại 1,15× |
| Thưởng đơn đầu | 30 xu, **không** tính doanh thu bán hàng |
| Xu hướng nhu cầu | Đổi mỗi 5 phút theo đồng hồ server |
| Đơn quán ăn | 2 món đang chuộng + 1 món tiếp theo; thưởng tổng vốn tham khảo +18 xu; 1 lần/hồ sơ/phiên |
| Hỗ trợ vốn | 24 xu nếu dưới 6 xu, không còn hàng trong túi/sạp; 1 lần/24 giờ |

- Tồn kho trong túi và hàng đang bày **tách biệt**. Đóng sạp trả hàng về túi.
- Giá hiển thị có thể được khai báo ở nhiều file UI; khi sửa cần rà soát đồng bộ, server vẫn quyết định giao dịch.
- `spent` chỉ được theo dõi từ giai đoạn 5; **doanh thu trừ chi nhập chưa phải lợi nhuận kế toán**.

### 2.2. Multiplayer và cộng đồng [BETA HIỆN CÓ]

- Hai khu **Sài Gòn 01 / Sài Gòn 02**, mặc định Sài Gòn 01.
- Đồng bộ vị trí qua WebSocket khoảng 100 ms; server kiểm tốc độ, tọa độ, giới hạn thao tác.
- Mua trực tiếp kiểm tra tiền, hàng, phiên bản lô, cùng khu và khoảng cách gần sạp.
- Mặc cả nhiều lượt, hết hạn 60 giây; hàng **không** được giữ trước khi chốt.
- Chat gần, rao hàng có giới hạn khoảng cách và cooldown.
- Tài khoản tên + mã khôi phục ngẫu nhiên, hash scrypt; không có khôi phục email.
- Bạn bè, hẹn gặp, chặn/báo cáo, nhiệm vụ ngày theo giờ Việt Nam.
- Chợ đêm mở 4 phút trên chu kỳ 8 phút; đơn chung 5 xoài + 6 bánh mì + 6 cà phê + 3 hoa; người góp được 60 xu và mở khóa đèn lồng khi đủ đơn.
- Feedback bản thử lưu trong SQLite settings.

### 2.3. Vấn đề đã quan sát [BETA HIỆN CÓ]

**Sáu người chơi thật cùng một khu đã báo rất lag.** Chưa biết nút thắt thuộc FPS phía client, network/tunnel hay server. Mô phỏng 60 kết nối không chứng minh 60 người chơi 3D hoạt động mượt. Đây là **rủi ro ưu tiên cao nhất** trước khi mở rộng thế giới.

### 2.4. Điểm nghịch lý cần xử lý [ĐỀ XUẤT]

Vốn khởi đầu 150 xu nhưng xe đẩy beta giá 100 xu. Nếu muốn có hành trình “bắt đầu từ hàng rong → lớn dần”, điều kiện nâng cấp và mục tiêu tích lũy **phải được cân bằng lại**, không chỉ tăng giá mua theo cảm tính. Cần kiểm tra thời gian kiếm tiền thật và xử lý công bằng với người chơi beta đã sở hữu xe/sạp.

## 3. CORE GAMEPLAY LOOP

```text
Quan sát nhu cầu / mục tiêu
        ↓
Chọn nghề và mặt hàng
        ↓
Nhập hàng, dùng vốn
        ↓
Chọn điểm bán + trưng bày + định giá
        ↓
Mở bán, tương tác NPC / người chơi
        ↓
Thu tiền, cập nhật tồn kho, xem lời lỗ
        ↓
Tái đầu tư / nâng cấp / mở nghề / nhận hợp đồng
        └──────────────────────────────────────↺
```

### 3.1. Ba tầng vòng lặp [ĐỀ XUẤT]

- **Ngắn (mỗi lượt bán):** Bày hàng, giá, mặc cả, phục vụ, phản hồi khách.
- **Trung (mỗi phiên chơi):** Chọn hàng đang có nhu cầu, vị trí, mức tồn kho, hoàn thành đơn, chi phí thuê.
- **Dài (nhiều phiên):** Từ mẹt → xe đẩy → sạp → gian trong chợ; danh tiếng, ngành nghề, trang trí, khách quen, thương hiệu.

### 3.2. Nhịp chơi mục tiêu [CHƯA CHỐT]

- 5–10 phút: có thể nhập, mở bán, hoàn thành đơn nhỏ, thu tiến độ.
- 15–25 phút: hợp đồng, tương tác bạn bè, chợ đêm, quản lý ngành hàng.
- Dài hạn: sưu tập trang trí, kinh doanh đa ngành, mở khóa khu cao hơn.
- Không cần online liên tục để bảo vệ tiến độ.

## 4. HỆ THỐNG PHÁT TRIỂN SẠP [ĐỀ XUẤT]

| Bậc | Hình thức | Quyền lợi gameplay | Rủi ro/giới hạn |
| --- | --- | --- | --- |
| 0 | Mẹt/gánh hàng rong | Mở bán dễ, vị trí khởi đầu miễn phí | Sức chứa nhỏ |
| 1 | Xe đẩy lưu động | Nhiều hàng hơn, di chuyển/chọn điểm bán, kiểu dáng theo nghề | Vốn đầu tư |
| 2 | Quầy vỉa hè mái bạt | Biển hiệu, trưng bày, kho nhỏ, vị trí ổn định | Phí sử dụng theo ca |
| 3 | Gian trong chợ Bến Thành | Phân khúc khách mới, hợp đồng, trưng bày chuyên ngành | Điều kiện thuê, chi phí vận hành |
| 4 | Gian thương hiệu | Trang trí sâu, khách quen, uy tín, nhân viên NPC ở giai đoạn sau | Quản lý chi phí, không tạo thu nhập vô hạn |

**Nguyên tắc:** Cấp sạp cao hơn mở **phong cách chơi và cơ hội mới**, không chỉ tăng sức chứa. Không xóa giá trị kinh doanh ngoài vỉa hè.

### 4.1. Điều kiện lên bậc [ĐỀ XUẤT]

Kết hợp **vốn**, **cột mốc kinh doanh có ý nghĩa** và **uy tín**. Tránh điều kiện “bán 1.000 món bất kỳ” vô nghĩa. Điều kiện chính xác cần thiết kế sau khi đo tốc độ kiếm xu.

### 4.2. Mốc mong muốn để playtest [CHƯA CHỐT]

- Xe đẩy đầu: khoảng 10–20 phút chơi tích lũy.
- Quầy mái bạt: khoảng 45–90 phút chơi tích lũy.
- Gian trong chợ: sau nhiều phiên có mục tiêu rõ ràng.

**Đây là giả thuyết sản phẩm, không phải yêu cầu cứng để triển khai.** Không chỉnh tham số trước khi có kiểm thử dữ liệu kinh tế.

### 4.3. Quyền sở hữu khác với vị trí xuất hiện [ĐỀ XUẤT]

- **Tài khoản sở hữu quyền/cấp kinh doanh** lâu dài.
- **Điểm mở bán trong khu** được phân bổ khi phiên chơi hoạt động; vị trí có thể hết chỗ.
- Tránh “ai đăng nhập trước giữ sạp mãi mãi”.
- Nếu về sau mở nhiều instance khu chợ, phải cho phép bạn bè tìm đến nhau.
- Không đưa ra cơ chế thu hồi sạp tự động làm mất tài sản khi offline mà chưa có quy tắc rõ và thông báo trước.

## 5. THẾ GIỚI VÀ BẢN ĐỒ [ĐỀ XUẤT]

### 5.1. Khu vỉa hè/hẻm ngoài chợ

Điểm khởi đầu có gánh hàng, mẹt, xe bánh mì, xe nước, trái cây; vài điểm nhập hàng, lối đi dễ quan sát và khu NPC khách quen. Mục tiêu: học nhập, bán và chọn chỗ.

### 5.2. Khu cổng chợ

Vùng chuyển tiếp có quầy mái bạt, mật độ khách đa dạng hơn, lựa chọn thuê vị trí, NPC giao hợp đồng.

### 5.3. Nhà lồng Bến Thành

Lấy cảm hứng từ không gian chợ Bến Thành nhưng **không bắt buộc mô phỏng đúng tỷ lệ địa lý**. Phân khu gameplay dự kiến:

- Thực phẩm tươi, trái cây, rau củ.
- Hàng ăn và đồ uống.
- Thời trang, giày dép, vải vóc.
- Đồ khô, đặc sản, thủ công và lưu niệm.

### 5.4. Chợ đêm

Tái sử dụng cơ chế chợ đêm beta làm nền; mở rộng theo từng bước với quầy sự kiện, khách theo đợt, đơn chung và quà trang trí. Không làm hỏng chu kỳ và phần thưởng cũ trước khi có thiết kế thay thế.

### 5.5. Nguyên tắc xây bản đồ

- Mở rộng **theo gameplay**, không theo diện tích thật.
- Ưu tiên tuyến đi ngắn, dễ nhận dạng, góc Việt Nam nhiều chi tiết vừa đủ.
- Tối ưu mô hình/texture/animation, hạn chế bóng động và số đối tượng vẽ.
- Không update/render toàn bộ NPC và cửa hàng bất kể khoảng cách.

## 6. NGÀNH NGHỀ, MẶT HÀNG VÀ CÁCH CHƠI [ĐỀ XUẤT]

| Ngành | Mặt hàng ví dụ | Gameplay đặc trưng | Tiến trình hình thức |
| --- | --- | --- | --- |
| Trái cây | Xoài, ổi, mận, chôm chôm | Nhu cầu theo thời điểm, độ tươi ở giai đoạn nâng cao | Mẹt → xe trái cây → sạp nông sản |
| Ăn uống | Bánh mì, xôi, hủ tiếu, bánh xèo | Phục vụ theo đơn, thao tác chế biến ngắn **tùy chọn** | Xe → quầy ăn → gian ẩm thực |
| Giải khát | Cà phê, nước mía, trà tắc, sinh tố | Giờ cao điểm, combo và nhu cầu khách | Thùng nước → xe nước → quầy giải khát |
| Hoa | Hoa hồng, cúc, sen, mai | Đơn dịp lễ, khách sự kiện | Gánh hoa → sạp hoa → cửa hàng hoa |
| Tạp hóa | Mì, bánh kẹo, nước ngọt | Nhiều SKU, quản lý tồn kho | Quầy nhỏ → sạp tạp hóa |
| Thời trang | Áo thun, nón, dép | Mẫu mã, trưng bày, mặc cả | Quầy vải → gian thời trang |
| Đặc sản/lưu niệm | Nón lá, thủ công, đồ khô | Khách du lịch, đơn giá trị cao | Xe → quầy → sạp đặc sản |

**MVP sau beta:** Không thêm ngay cả bảy ngành. Bắt đầu với **4 món hiện hữu: xoài, bánh mì, cà phê, hoa** để kiểm chứng bốn hành vi kinh doanh khác nhau. Có thể thêm mặt hàng về sau.

### 6.1. Quy tắc đổi nghề

- Cho phép người chơi thử nhiều nghề; không khóa vĩnh viễn.
- Mỗi ngành nên có **ít nhất một quyết định gameplay độc đáo**.
- Đồ trang trí/giao diện cho nghề không thay cho cơ chế nghề.
- Minigame lặp đi lặp lại không được thành bắt buộc trong mỗi lần bán.

## 7. NPC KHÁCH HÀNG, NHU CẦU VÀ MẶC CẢ [ĐỀ XUẤT]

### 7.1. Nhóm khách

- **Khách bình dân:** Nhạy cảm về giá, cần hàng thiết yếu.
- **Khách vội:** Ưu tiên giao dịch nhanh.
- **Khách du lịch:** Chú ý quà lưu niệm/đặc sản và trưng bày.
- **Khách quen:** Có thể quay lại nhờ lịch sử phục vụ tốt.
- **Khách đặt hàng:** Mua theo đơn và yêu cầu riêng.

Không cần tạo AI đồ họa/phức tạp cho từng nhóm ngay. Nên bắt đầu từ **quy tắc quyết định mua ở server**, rồi mới thể hiện hành vi tương ứng ở client.

### 7.2. Mô hình nhu cầu

Biến đầu vào khả dĩ: loại hàng, khu vực, thời điểm, xu hướng thị trường, giá, mức phục vụ/uy tín. Phải hiển thị phản hồi dễ hiểu như “Giá hơi cao”, “Giờ cao điểm”, “Khu này ít khách mua hoa”. Chưa chốt công thức xác suất hay hệ số giá; cần thử cân bằng.

### 7.3. Giao thương giữa người chơi

- Giữ mua trực tiếp và mặc cả đã có.
- Có thể thêm đề nghị nhanh, combo/lô hàng sau khi đảm bảo nguyên tử giao dịch.
- Chưa cho phép sở hữu độc quyền nguồn hàng thiết yếu qua thị trường người chơi.
- Bảo vệ trường hợp hai khách mua món cuối cùng, hai lời đề nghị chốt đồng thời, mất kết nối hoặc client gửi lặp.

## 8. KINH TẾ, TIỀN THUÊ, LỢI NHUẬN [ĐỀ XUẤT]

### 8.1. Tiền tệ

Tiếp tục dùng **xu** làm tiền chính. Không vội thêm kim cương, vé thuê, hoặc nhiều loại tiền phụ làm hệ thống khó hiểu.

### 8.2. Dòng xu

- **Nguồn xu vào:** NPC trả tiền bán hàng, đơn/quà nhiệm vụ, sự kiện, hỗ trợ vốn có giới hạn.
- **Dòng chuyển xu:** Người chơi giao dịch với nhau (không tự tạo thêm tổng xu nếu không có thưởng).
- **Nguồn xu ra:** Nhập từ NPC, phí thuê ca, nâng cấp, trang trí, chi phí dịch vụ (nếu có).
- Cần thống kê phân tách các loại dòng tiền để đánh giá lạm phát.

### 8.3. Hạch toán

```text
Doanh thu bán hàng = Tổng giá trị hàng đã bán
Giá vốn hàng bán = Giá vốn của chính những món đã bán
Lợi nhuận kinh doanh = Doanh thu - Giá vốn hàng bán - Chi phí hoạt động liên quan
Tồn kho chưa bán = Tài sản tồn kho, không tự động coi toàn bộ là chi phí kỳ
Thưởng/nhiệm vụ = Hạch toán riêng, không cộng vào doanh thu bán hàng
```

Dữ liệu `spent` trong beta chưa đủ để dựng lịch sử lợi nhuận đúng tuyệt đối. Cần xác định cách làm baseline, migration và nhãn “ước tính/từ ngày X” cho dữ liệu cũ; không trình bày số liệu sai là lợi nhuận chính xác.

### 8.4. Thuê sạp theo ca

- Người chơi tự mở ca, biết phí trước khi đồng ý.
- Không trừ tiền thuê liên tục khi offline.
- Khi hết ca, có thông báo rõ và xử lý trả hàng về túi/kho an toàn.
- Không áp dụng nợ lũy kế buộc đăng nhập liên tục.
- Mô hình phí, thời lượng và giới hạn thuê vẫn **[CHƯA CHỐT]**.

### 8.5. Chống lạm phát và lạm dụng

Giới hạn thưởng lặp, kiểm tra nhiệm vụ/đơn hoàn thành trùng, ngăn nhân đôi xu/hàng, xem xét farm qua tài khoản phụ, không giải quyết lạm phát bằng cách phạt người mới bằng phí cực cao.

## 9. UY TÍN, THƯƠNG HIỆU, TRANG TRÍ [ĐỀ XUẤT]

- Uy tín dựa trên hoạt động thực sự có ý nghĩa: hoàn tất đơn, phục vụ ổn định, hợp đồng, đóng góp cộng đồng; không chỉ đếm số click.
- Đặt tên sạp có lọc nội dung và độ dài; ví dụ “Bánh Mì Cô Ba”, “Cà Phê Chú Tư”.
- Cho thay bảng hiệu, mái bạt, vật dụng, quần áo người bán, trang trí theo ngành.
- Trang trí chủ yếu mang giá trị thể hiện bản thân, tránh pay-to-win.
- Khách quen có thể là nhánh phát triển dài hạn nhưng không tạo doanh thu tự động vô hạn.

## 10. CỘNG ĐỒNG VÀ HOẠT ĐỘNG [ĐỀ XUẤT]

Giữ các tính năng beta: bạn bè, chat gần, rao hàng, mặc cả, chợ đêm, nhiệm vụ ngày, báo cáo/chặn.

Mở rộng có kiểm soát:

- **Đơn liên kết:** Nhiều người góp những loại hàng khác nhau cho đơn chung.
- **Khách đoàn:** Đợt khách theo lịch/sự kiện, không nhất thiết spawn nhiều NPC đồ họa cùng lúc.
- **Hội chợ chủ đề:** Đặc sản, trái cây, hoa, ẩm thực.
- **Gian hàng bạn bè:** Ghé thăm, xem bảng hiệu và mua hàng.

Không ép kết bạn làm điều kiện thăng tiến. Không cho phá sạp, cướp hàng, chiếm vị trí vĩnh viễn hoặc gây mất tài sản người khác.

## 11. HƯỚNG DẪN NGƯỜI MỚI VÀ UX [ĐỀ XUẤT]

### 11.1. Mục tiêu 10 phút đầu [CHƯA CHỐT]

1. 0–2 phút: vào game, có mẹt, thấy vị trí bán và mục tiêu đầu tiên.
2. 2–4 phút: nhập vài món với vốn sẵn có.
3. 4–6 phút: bày hàng, chọn giá, bán đơn đầu.
4. 6–8 phút: xem lời lỗ, nhận phần thưởng đơn đầu.
5. 8–10 phút: gặp tiểu thương khác/nhận đơn nhỏ và hiểu mục tiêu nâng cấp xe đẩy.

### 11.2. UI

- Ba thao tác rõ ràng: **Nhập hàng — Mở bán — Quản lý sạp**.
- Sổ hiển thị riêng tiền mặt, số món, giá vốn, doanh thu, lợi nhuận ước tính.
- Phản hồi giao dịch rõ nguyên nhân: thiếu tiền, hết hàng, xa sạp, giá thay đổi, giao dịch hết hạn.
- Mobile: joystick, góc nhìn, menu, đóng bảng, vùng chạm, font chữ, tránh bảng tràn và chạm nhầm.

## 12. KIẾN TRÚC CODE VÀ LƯU Ý THỰC THI

### 12.1. Bản đồ module [BETA HIỆN CÓ — THEO BÀN GIAO]

| Module | Vai trò |
| --- | --- |
| `server.js` | HTTP, WebSocket, khu chơi, tiền/hàng, sạp, giao dịch, NPC, xe |
| `business.js` | Nhu cầu theo phiên, đơn quán ăn, vốn hỗ trợ, danh hiệu, đóng sạp |
| `community.js` | Tài khoản, bạn bè, chặn/báo cáo, nhiệm vụ, chợ đêm |
| `store.js` | SQLite, giao dịch lưu dữ liệu, nhập JSON giai đoạn trước |
| `operations.js` | Backup, health, bảo trì |
| `public/game.js` | Three.js, bản đồ, nhân vật, camera, chuyển động, joystick |
| `public/market.js` | Sạp, nhập hàng, mua trực tiếp, mặc cả |
| `public/business-ui.js` | Sổ kinh doanh, hướng dẫn, đơn hàng, quản lý sạp |
| `public/community.js` | Bạn bè, nhiệm vụ, tài khoản, chợ đêm |
| `public/index.html`, `public/style.css` | Giao diện và responsive |
| `test/` | Automated test, load simulation |

### 12.2. Mẫu triển khai cơ chế mới

Trước khi code, cần điền:

```text
Tên cơ chế:
Nhóm giai đoạn:
Mục tiêu trải nghiệm:
Hành vi người chơi:
Điều kiện mở/điều kiện từ chối:
Input / Output / chi phí / phần thưởng:
Luật, công thức và cooldown [giá trị nào chưa chốt?]:
Dữ liệu persistent và migration:
Schema WebSocket, server validation:
Ảnh hưởng tới tiền / hàng / tồn kho / lịch sử:
Tương tác đồng thời / gửi lặp / mất mạng:
Files liên quan (sau khi kiểm tra repo):
UI / mobile:
Kịch bản kiểm thử / tiêu chí nghiệm thu:
Rollback / tương thích người chơi beta:
```

### 12.3. Bất biến kỹ thuật

- Không chuyển tiền/trừ hàng một phần nếu điều kiện giao dịch còn lại thất bại.
- Lưu thay đổi nguyên tử trước khi trả xác nhận thành công.
- Idempotency hoặc cơ chế tương đương cho sự kiện dễ gửi lặp như mua, chốt đơn, nhận thưởng.
- Không tin các trường giá/tiền/số lượng do client tự tính khi chốt.
- Kiểm tra kiểu, giới hạn số, quyền, khoảng cách, cooldown, phiên bản lô, điều kiện cùng khu.
- Dữ liệu cũ có giá trị mặc định hợp lệ khi thêm cột/trường.
- Backup/restore cần kiểm tra WAL khi SQLite đang chạy.

### 12.4. Lệnh kiểm tra [BETA HIỆN CÓ]

```bash
npm install
npm run dev          # local: http://localhost:5180
npm run check
npm test
npm run load         # mô phỏng 60 kết nối, không bảo đảm FPS/trải nghiệm thực
node --check <file>  # cho module JS mới/sửa ngoài phạm vi check gốc
```

Trước khi thay đổi dữ liệu, đọc hướng dẫn backup/restore hiện có. Không chạy `npm run dev` hay mở tunnel nếu nhiệm vụ hiện tại chỉ yêu cầu đọc tài liệu hoặc lập kế hoạch.

## 13. ƯU TIÊN HIỆU NĂNG TRƯỚC KHI MỞ BẢN ĐỒ

### 13.1. Vấn đề phải chẩn đoán

Người dùng thực tế **6 người cùng khu lag nhiều**. Các giả thuyết cần phân biệt:

- **Client:** draw call, bóng đổ, chất lượng model/texture, nhãn tên, render loop, update UI.
- **Network:** Cloudflare Tunnel, payload snapshot, tần suất gửi vị trí, jitter/ping, băng thông.
- **Server:** vòng cập nhật NPC, snapshot đồng bộ, serialization, lưu SQLite, CPU/RAM.

### 13.2. Quy trình đo [ĐỀ XUẤT]

1. Thêm/thu thập FPS và frame time trên PC/điện thoại thật.
2. Đo ping, jitter, snapshot size/rate, số entities visible.
3. Đo tick duration, CPU/RAM và thời gian truy vấn/ghi dữ liệu ở server.
4. Thử điều kiện 1/3/6 người và so sánh local LAN với qua tunnel khi phù hợp.
5. Chỉ tối ưu nút thắt đã xác nhận; cân nhắc giảm draw call, bóng/nhãn, update không cần thiết, nội suy vị trí và interest management.
6. Thử lại 6 người thật trước khi khẳng định đạt hiệu năng hoặc mở thêm NPC/sạp.

**Không suy ra “cần máy chủ mạnh hơn” khi chưa biết nghẽn ở đâu.**

## 14. LỘ TRÌNH PHÁT TRIỂN THEO GIAI ĐOẠN

| Giai đoạn | Mục tiêu | Đầu ra chấp nhận |
| --- | --- | --- |
| **A — Ổn định beta** | Chẩn đoán lag; sửa vấn đề nghiêm trọng; mobile UX; instrument kinh tế | Nhóm 6 người có số liệu FPS/ping/server và các lỗi trọng yếu được phân loại |
| **B — Vertical slice hàng rong** | Một góc phố ngoài chợ; mẹt/xe/quầy; onboarding; 4 món beta; sổ lời lỗ | Người mới hoàn thành vòng bán đầu và hiểu mục tiêu xe đẩy |
| **C — Nghề và vị trí** | Đặc tính khác nhau cho nghề; nhóm nhu cầu NPC; thuê quầy có thời hạn rõ ràng | Chọn nghề/vị trí tạo quyết định kinh doanh khác nhau |
| **D — Bến Thành** | Nhà lồng, phân khu, sạp trong chợ, thương hiệu, uy tín, khách đặc trưng | Tiến trình vỉa hè → trong chợ có ý nghĩa, không chặn người cũ |
| **E — Cộng đồng nâng cao** | Đơn liên kết, khách đoàn, hội chợ, buôn sỉ, thương hiệu | Có hoạt động hợp tác mà người chơi solo vẫn tiến bộ được |

Tên giai đoạn chỉ để quản lý phạm vi, **không phải cam kết thời điểm phát hành**.

### 14.1. Vertical slice đề xuất [ĐỀ XUẤT]

- **Một** góc phố ngoài chợ có chất Việt, thay vì dựng toàn Bến Thành.
- **Bốn** sản phẩm hiện có: xoài, bánh mì, cà phê, hoa.
- **Ba** hình thức bán: mẹt → xe đẩy → quầy mái bạt (không có nghĩa phải sửa ngay định giá beta).
- **Sáu** người chơi thật thử ổn định trước khi tăng tải.
- Hoàn chỉnh chuỗi: nhập → mở bán → NPC mua / người chơi mặc cả → sổ lời lỗ → đầu tư.

## 15. TIÊU CHÍ ĐÁNH GIÁ / PLAYTEST [CHƯA CHỐT]

| Hạng mục | Mục tiêu thử nghiệm | Cách đo |
| --- | --- | --- |
| Onboarding | ≥80% người mới bán đơn đầu trong ≤5 phút không cần chỉ từng nút | Quan sát người thật, đo thời gian |
| Minh bạch kinh tế | Người chơi phân biệt được doanh thu và lợi nhuận | Hỏi ngắn sau phiên |
| Tiến trình | Người chơi hiểu muốn lên cấp tiếp cần làm gì | Phỏng vấn sau phiên |
| Chiều sâu nghề | Có ít nhất 2 nghề tạo lựa chọn khác nhau ngoài giá/model | Quan sát quyết định kinh doanh |
| Tính toàn vẹn | Không nhân đôi xu/hàng khi 2 người chốt cùng lúc, gửi lặp, rớt mạng | Test tự động và manual |
| Hiệu năng | Thử lại 6 người thật; mục tiêu hướng tới ≥30 FPS trên thiết bị Android tầm trung kiểm thử | FPS/frame time/ping trên thiết bị thật |
| Retention | Người chơi có lý do quay lại mà không vì sợ mất đồ offline | Phỏng vấn, thử nghiệm nhiều phiên |

Mọi mục tiêu đo lường cần điều chỉnh sau kết quả thực tế; chưa có đủ dữ liệu xác nhận.

## 16. CHƯA NÊN LÀM NGAY

- Sao chép bản đồ Bến Thành 1:1 với nhiều nội thất chi tiết.
- Hàng trăm món và hàng chục nghề ngay trong một bản cập nhật.
- Nhân viên NPC tự điều hành nhiều cửa hàng.
- Chuỗi cung ứng/phân phối nhiều tầng quá phức tạp.
- Phí thuê trừ khi offline, mất sạp/mất hàng khi nghỉ lâu.
- Tiền tệ phụ hay pay-to-win trong kinh tế.
- Để client tự cấp thưởng, tự xác nhận giá hoặc tự cập nhật tồn kho chính thức.

## 17. DANH SÁCH QUYẾT ĐỊNH CHƯA CHỐT

1. Giá và điều kiện nâng cấp thực tế sau beta, chính sách bảo toàn sạp đã sở hữu.
2. Cấu trúc các vị trí bán khi số người lớn hơn số chỗ sạp.
3. Công thức uy tín và điều kiện thuê vị trí trong chợ.
4. Phí/độ dài ca kinh doanh và xử lý kết thúc ca.
5. Công thức nhu cầu từng nghề/NPC, thị trường sỉ và hàng tươi.
6. Cách kế toán giá vốn cho hồ sơ cũ không có dữ liệu lịch sử đầy đủ.
7. Quy mô bản đồ, chất lượng asset/LOD và tiêu chí thiết bị mục tiêu.
8. Ngưỡng KPI chính thức sau khi playtest.

Codex **không tự đặt các giá trị chưa chốt làm quy tắc production**; có thể đưa ra phương án và lý do để chủ dự án quyết định.

## 18. NHIỆM VỤ NÊN LÀM ĐẦU TIÊN KHI CHỦ DỰ ÁN YÊU CẦU

**Ưu tiên 1 — Audit repository, chưa code:**

1. Đọc tài liệu bàn giao và GDD này.
2. Mở source code thực tế, đối chiếu từng module và pipeline giao dịch.
3. Ghi rõ phần **đã có / có nhưng thiếu / chưa có / sai khác tài liệu**.
4. Kiểm tra khả năng đo và cô lập nguyên nhân lag 6 người.
5. Đề xuất backlog giai đoạn A và giai đoạn B, ước lượng phụ thuộc kỹ thuật, cách bảo toàn dữ liệu cũ.
6. Trình phương án triển khai nhỏ nhất và các rủi ro để chủ dự án duyệt.

**Ưu tiên 2 — Chỉ khi được giao nhiệm vụ cụ thể:** Triển khai từng hạng mục, thêm test, chạy `npm run check` và `npm test`; báo lại file đã sửa, kết quả kiểm thử, tồn tại, tác động đến người chơi cũ.

### Prompt gợi ý để sử dụng cùng file này

> Hãy đọc `CHO_COC_ONLINE_GDD_V0_1_CODEX.md` và tài liệu `BAN_GIAO_CO_CHE_VA_PLAYTEST(1).md`, sau đó kiểm tra toàn bộ repository Chợ Cóc Online. **Chưa sửa code.** Trả về: (1) bảng hiện trạng theo module; (2) điểm mâu thuẫn với GDD; (3) những nguy cơ mất tiền/hàng và hiệu năng; (4) backlog giai đoạn A/B có thứ tự; (5) kế hoạch vertical slice nhỏ nhất, kèm test và phương án migration không mất dữ liệu. Không tự triển khai các ý tưởng chưa chốt.

---

**TÓM TẮT TINH THẦN DỰ ÁN:** Người chơi bắt đầu bằng một mẹt hàng ngoài vỉa hè, dùng quyết định kinh doanh để phát triển dần, xây sạp và thương hiệu ở khu chợ mang bản sắc Việt Nam. Trò chơi phải dễ vui trong phiên ngắn nhưng đủ chiều sâu để có lý do trở lại; mọi tiến trình kinh tế cần công bằng, bảo toàn dữ liệu và vận hành ổn định trong multiplayer.
