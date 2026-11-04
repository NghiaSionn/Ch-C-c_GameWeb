# CHỢ CÓC ONLINE — BÀN GIAO CƠ CHẾ VÀ THỬ NGHIỆM

## 1. Mục đích
Tài liệu này là điểm bắt đầu để sửa, thay hoặc bổ sung cơ chế game. Dự án nằm tại `C:\Users\nghia\ao\projects\ChoCocOnline`, độc lập với GameCatWeb. Không coi các tính năng prototype là đã sẵn sàng phát hành rộng rãi.

## 2. Chạy và kiểm tra
- Node.js >=24; đã chạy local trên Node.js 26.
- `npm install`, `npm run dev`, mở http://localhost:5180.
- `npm run check`: kiểm tra cú pháp các module gốc. Khi sửa module mới, chạy thêm `node --check <file>`.
- `npm test`: kiểm thử kinh tế, cộng đồng, SQLite và bản thử.
- `npm run load`: mô phỏng 60 kết nối, mặc định 60 giây. Không thay thế thử tải máy chủ thật hoặc GPU trên điện thoại.
- Máy chủ và tunnel công khai đã được tắt theo yêu cầu trước đó. Việc tạo tài liệu và chạy test không mở lại link công khai.

## 3. Bản đồ mã nguồn
| File | Vai trò / sửa ở đâu |
|---|---|
| `server.js` | HTTP, WebSocket, máy chủ khu chơi, tiền/hàng, sạp, giao dịch, mặc cả, NPC, xe hàng, ghi phản hồi |
| `business.js` | Nhu cầu theo phiên, đơn hàng quán ăn, vốn hỗ trợ, danh hiệu, đóng sạp |
| `community.js` | Tài khoản/mã khôi phục, bạn bè, chặn/báo cáo, nhiệm vụ ngày, chợ đêm, thưởng chung |
| `store.js` | SQLite, giao dịch lưu dữ liệu, nhập JSON giai đoạn 2 |
| `operations.js` | Sao lưu SQLite khi chạy, giữ 24 bản, sức khỏe máy chủ, dừng bảo trì |
| `public/game.js` | Three.js: bối cảnh, nhân vật, camera, di chuyển, va chạm, hiệu ứng, joystick |
| `public/market.js` | Giao diện sạp, nhập hàng, mua trực tiếp và mặc cả |
| `public/community.js` | Giao diện bạn bè, nhiệm vụ, cá tính, tài khoản, chợ đêm |
| `public/business-ui.js` | Sổ buôn bán, hướng dẫn mở hàng, đơn hàng và quản lý sạp |
| `public/feedback.js` | Biểu mẫu góp ý bản thử |
| `public/index.html`, `public/style.css` | Khung và bố cục giao diện |
| `scripts/backup.mjs`, `scripts/restore.mjs` | Sao lưu thủ công và khôi phục vào thư mục mới |
| `scripts/reports.mjs` | Đọc báo cáo người chơi bằng dòng lệnh |
| `test/` | Các kiểm thử tự động và mô phỏng tải |
| `Dockerfile`, `compose.yaml` | Cấu hình triển khai một tiến trình Node; cần máy chủ và HTTPS thực tế |

## 4. Cơ chế hiện tại và các tham số
### Kinh doanh
- Vốn hồ sơ mới: 150 xu (`server.js`, nhánh join).
- Xoài: vốn 8, giá tham khảo 15; bánh mì: 11/20; cà phê: 6/12; hoa: 14/25 (`goods` trong server).
- Các giá hiển thị cũng có bản khai báo trong `public/market.js`, `public/game.js` và `public/business-ui.js`. Khi thay giá, cần đồng bộ UI; máy chủ luôn là nơi quyết định giao dịch.
- Mẹt chứa 10 món; xe đẩy giá 100 xu/chứa 30; sạp lớn giá 250/chứa 80.
- 8 chỗ sạp/khu; tối đa cấu hình 60 người/khu. Chưa bảo đảm quy mô MMO.
- Hàng trong túi và hàng đang bày tách biệt. Đóng sạp trả hàng vào túi.
- NPC mua một món/sạp online mỗi 30 giây. Món đang chuộng chấp nhận giá đến 1,5 lần tham khảo; món khác 1,15 lần. Có thể điều chỉnh trong vòng NPC của server.
- Đơn đầu thưởng 30 xu, không tính là doanh thu bán hàng.
- Nhu cầu đổi theo đồng hồ máy chủ mỗi 5 phút (`business.js`).
- Đơn quán ăn: 2 món đang chuộng +1 món tiếp theo; thưởng tổng vốn tham khảo +18 xu. Mỗi hồ sơ chỉ chốt một lần/phiên, hàng lấy từ túi.
- Hỗ trợ 24 xu khi dưới 6 xu, không còn hàng trong túi/sạp, một lần mỗi 24 giờ.
- Thống kê `spent` chỉ được theo dõi từ khi bổ sung giai đoạn 5. Chênh lệch doanh thu và chi nhập KHÔNG phải lợi nhuận kế toán; chưa phân bổ giá vốn tồn kho, đầu tư sạp hoặc thưởng.

### Multiplayer và giao dịch
- Hai khu Sài Gòn 01/02, Sài Gòn 01 mặc định.
- WebSocket đồng bộ vị trí khoảng 100 ms. Máy chủ kiểm tra tốc độ, giới hạn tọa độ và số thao tác.
- Mua trực tiếp kiểm tra giá/phiên bản lô; chốt khi đủ tiền, còn hàng, cùng khu và gần sạp.
- Mặc cả có lượt đề nghị/trả giá, hết hạn 60 giây; không giữ hàng trước khi chốt.
- Chat gần và rao giới hạn khoảng cách; rao có cooldown.
- Đổi biến tiền/hàng ở UI không được xem là giao dịch hợp lệ. Mọi cơ chế mới phải xác thực ở server.

### Cộng đồng
- Tài khoản tên + mã khôi phục ngẫu nhiên, hash scrypt ở server. Mã chỉ hiện một lần. Chưa khôi phục email.
- Bạn bè cần chấp nhận; có lời hẹn gặp và link chọn khu.
- Nhiệm vụ ngày theo giờ Việt Nam: nhập hàng, bán hàng, mua ở sạp người khác, chào.
- Chợ đêm mở 4 phút/chu kỳ 8 phút. Đơn chung: 5 xoài +6 bánh mì +6 cà phê +3 hoa. Người góp nhận 60 xu và mở khóa đèn lồng sau khi đủ đơn.
- Nút xem thử ánh sáng đêm chỉ thay cảnh, không mở đơn máy chủ.
- Báo cáo lưu trong settings SQLite, cần quản trị viên xử lý. Chưa có bảng quản trị hoặc khóa tài khoản hoàn chỉnh.

## 5. Giai đoạn 7 — chuẩn bị thử người thật
Đã bổ sung biểu mẫu “Góp ý bản thử”. Người chơi vào nhân vật trước khi gửi. Phản hồi lưu trong settings của SQLite với key `feedback`, gồm mã nhân vật, khu chơi, thời điểm và mô tả; giới hạn độ dài và tần suất. Không thu mật khẩu/mã khôi phục. Chưa có hệ thống gửi phản hồi ra dịch vụ bên ngoài.

### Kịch bản một buổi thử (đề xuất 5–10 người)
1. Một người mới vào, nhận mẹt, nhập 3 món, bày và bán đơn đầu mà không được chỉ từng nút.
2. Hai người kết bạn và tìm nhau trong cùng khu.
3. Một người mua trực tiếp; hai người mặc cả, trả lại giá rồi chốt.
4. Hai khách thử mua món cuối cùng, xác nhận không bị nhân đôi hàng.
5. Thử đơn quán ăn, trường hợp thiếu hàng và gửi lại đơn đã hoàn thành.
6. Thử chợ đêm, nhiều người góp hàng; kiểm tra thưởng và đèn lồng.
7. Thoát/vào lại; đăng nhập bằng mã trên trình duyệt khác; kiểm tra tiền và tồn kho.
8. Chặn chat, gửi báo cáo, gửi góp ý.
9. Thử trên điện thoại: joystick, menu, xoay/zoom, tránh bấm nhầm và bảng tràn.
10. Dừng máy chủ có thông báo bảo trì, chạy lại và kiểm tra tiến độ.

### Ghi nhận sau buổi thử
| Người / thiết bị | Việc đang làm | Mong đợi | Thực tế | Lặp lại được? | Mức độ | Hướng sửa |
|---|---|---|---|---|---|---|
| | | | | | | |

Ưu tiên lỗi: mất tiền/hàng/tiến độ → không vào được/không giao dịch được → điều khiển khó → cân bằng kinh tế → thẩm mỹ. Không coi số người mô phỏng là phản hồi người thật. Chưa có buổi thử cộng đồng được quan sát và tổng hợp trong phiên này.

## 6. Quy trình thêm một cơ chế mới
1. Mô tả người chơi làm gì, nhận/mất tài nguyên nào và điều kiện thất bại.
2. Xác định module server phụ trách. Thêm thông điệp WebSocket có schema hẹp; kiểm tra kiểu, giới hạn, quyền, khoảng cách và cooldown.
3. Thực hiện thay đổi tiền/hàng và lưu trước khi xác nhận thành công. Tránh trừ một phần rồi mới kiểm tra phần còn lại.
4. Nếu thêm trường dữ liệu, cung cấp giá trị mặc định cho hồ sơ cũ; không xóa database để “sửa” migration.
5. Tạo giao diện tương ứng và thông báo lỗi dễ hiểu.
6. Kiểm thử: thành công, thiếu tiền/hàng, gửi lặp, hai người đồng thời, ngắt mạng, chạy lại server.
7. Cập nhật bảng tham số và ghi rõ tác động tới người chơi cũ.

Mẫu đặc tả:
- Tên cơ chế:
- Mục đích / tình huống:
- Điều kiện mở:
- Đầu vào / đầu ra / chi phí:
- Công thức / giới hạn / cooldown:
- Dữ liệu lưu:
- Tương tác multiplayer:
- Trường hợp lỗi và chống lạm dụng:
- File cần sửa:
- Kiểm thử chấp nhận:

## 7. Tiến độ trung thực và việc còn lại
- Giai đoạn 1–3: có nền prototype và kiểm thử; không tương đương sản phẩm phát hành.
- Giai đoạn 4: mới có zoom, joystick, menu gọn, góc hàng ăn và một số chi tiết. Còn nhân vật/mô hình đẹp hơn, đường đi tránh vật cản, hàng 3D theo tồn kho và âm thanh đầy đủ.
- Giai đoạn 5: có sổ, nhu cầu, đơn hàng, vốn hỗ trợ và đóng sạp. Chưa cân bằng bằng dữ liệu người thật; chưa thu hồi sạp nghỉ lâu tự động.
- Giai đoạn 6: có healthz, backup, script restore và cấu hình Docker. Đã kiểm thử đọc lại bản backup SQLite có WAL. Chưa triển khai máy chủ cố định, cảnh báo ngoài ứng dụng, bảng quản trị, hoặc quy trình khôi phục dịch vụ end-to-end trên production. Docker chưa build trong môi trường này.
- Giai đoạn 7: đã chuẩn bị feedback và kiểm thử bổ sung; cần buổi thử người thật và vòng sửa tiếp theo.
- Public tunnel cũ là link tạm; đã đóng. Không tự động mở lại khi chạy kiểm thử.

## 8. Dữ liệu và bàn giao
Dữ liệu chính: `data/market.sqlite`, có thể kèm WAL/SHM khi đang chạy. Backup trong `data/backups`. Dữ liệu chứa khóa phiên và thông tin tài khoản hash: không đưa lên Git hoặc gửi kèm ảnh báo lỗi.
Để phục hồi, tạo bản sao vào thư mục mới bằng `node scripts/restore.mjs <backup.sqlite> <new-data-dir>`; chạy thử với DATA_DIR mới và kiểm tra trước khi thay dữ liệu vận hành. Không ghi đè database đang mở.

Kiểm thử bổ sung nằm ở `test/playtest.test.mjs`: vốn hỗ trợ/cooldown, đơn hàng/chống gửi lặp, trả hàng khi đóng sạp, backup SQLite và dữ liệu WAL. Các file kinh tế/cộng đồng kiểm tra chuyển tiền, tồn kho, mặc cả, khôi phục tài khoản, kết bạn, chặn, nhiệm vụ và chợ đêm.

## Phản hồi thử thực tế: hiệu năng
Người dùng đã thử 6 người trong cùng một khu và báo rất lag. Chưa xác định nghẽn ở FPS trình duyệt, mạng/tunnel hay xử lý máy chủ. Khi chia sẻ qua Cloudflare Tunnel, máy người dùng đang chạy Node.js là máy chủ game.
Kết quả mô phỏng 60 kết nối chỉ đo giao thức và nhịp snapshot, không chứng minh trải nghiệm đồ họa/mạng thực tế.
Việc tiếp theo khi được tiếp tục tối ưu: thêm đo FPS và ping; đo từng thiết bị; tối ưu bóng đổ/draw calls/nhãn tên, gửi vị trí khi thay đổi và nội suy, giảm ghi dữ liệu/cập nhật UI; thử lại với nhóm 6 người trước khi quyết định máy chủ riêng.
Trạng thái giai đoạn 7: đã chuẩn bị feedback và kiểm thử tự động, đã có phản hồi người thật; chưa nghiệm thu do vấn đề hiệu năng. Tạm ghi nhận, chưa thực hiện thay đổi tối ưu theo yêu cầu người dùng.
