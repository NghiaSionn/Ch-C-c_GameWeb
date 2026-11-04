# Chợ Cóc Online · Giai đoạn 3

Dự án độc lập với GameCatWeb. Bản 3D multiplayer chạy Node.js và WebSocket. Cần Node.js 24 trở lên; bản local được kiểm tra trên Node.js 26.

## Chơi tại máy

`npm install`, sau đó `npm run dev`, mở http://localhost:5180. Sài Gòn 01 là khu mặc định. Link `/?room=S%C3%A0i%20G%C3%B2n%2001` chọn sẵn khu chơi. Thiết bị trong LAN có thể truy cập IP máy chủ nếu tường lửa cho phép.

## Giai đoạn 3

- Hoạt ảnh chào, cảm ơn, vui mừng và rao hàng, đồng bộ người ở gần. Rao hàng có thời gian chờ chống spam.
- Đổi màu áo, nón lá, khăn buộc đầu; trang trí sạp bằng hoa hoặc đèn lồng đã mở khóa.
- Mã bạn bè, lời mời/chấp nhận, trạng thái online/khu đang chơi, mời gặp và đi tới sạp. Người nhận đồng ý trước khi kết bạn.
- Nhiệm vụ ngày theo giờ Việt Nam: nhập hàng, bán hàng, mua ở sạp người khác và chào bà con. Nhận thưởng một lần/nhiệm vụ/ngày.
- Chợ đêm mở 4 phút mỗi chu kỳ 8 phút theo giờ máy chủ: ánh sáng đổi, đèn bật, cả khu góp đơn 5 xoài + 6 bánh mì + 6 cà phê + 3 hoa. Người góp nhận 60 xu và mở khóa đèn lồng khi hoàn tất. Tiến độ và thưởng được lưu, chống nhận lặp. Nút xem thử ánh sáng đêm không thay đổi sự kiện máy chủ.
- Chặn chat/rao/lời mời, bỏ chặn, báo cáo có lý do. Báo cáo lưu riêng trong SQLite, không tự động xử phạt; quản trị viên cần xử lý bằng `npm run reports`.
- Tài khoản bằng tên và mã khôi phục ngẫu nhiên. Mã hiển thị một lần; máy chủ chỉ giữ hash scrypt. Đăng nhập thiết bị khác đổi khóa phiên, vô hiệu hóa khóa cũ. Không có email khôi phục; mất cả phiên và mã sẽ không tự khôi phục được.
- SQLite giao dịch, WAL. Tự nhập dữ liệu `data/market.json` giai đoạn 2 khi chưa có cơ sở dữ liệu; giữ nguyên file JSON cũ. Từ đây dữ liệu chính ở `data/market.sqlite` cùng WAL/SHM. Không sao chép dữ liệu đang chạy bằng cách chỉ lấy file sqlite; dùng backup SQLite hoặc dừng server trước khi copy.

## Kiểm tra

- `npm run check`: cú pháp server, modules và trình duyệt.
- `npm test`: kinh tế giai đoạn 2 và tài khoản/khôi phục, kết bạn, chặn, nhiệm vụ, thưởng chợ đêm và SQLite.
- `npm run load`: tải tổng hợp 60 kết nối, gửi di chuyển và đo nhịp snapshot; có thể điều chỉnh `LOAD_SECONDS`. Kết quả không thay thế thử nghiệm trên máy chủ triển khai.

## Chạy online

Đã kèm Dockerfile và compose để chạy một tiến trình Node với volume dữ liệu bền vững. Chạy `docker compose up -d --build` trên máy chủ, rồi đặt reverse proxy HTTPS/WebSocket trước cổng 127.0.0.1:5180. Giữ cùng origin cho trang và socket. Không đưa recovery code hoặc thư mục data vào kho mã công khai. Docker chưa được build/triển khai trong phiên local này nếu chưa có Docker hoặc máy chủ.

Nền tảng Sites trong phiên này dùng Workers, không chạy trực tiếp máy chủ Node WebSocket hiện tại. Để phát hành bằng Sites cần chuyển backend sang kiến trúc phù hợp; không thể chỉ upload giao diện rồi gọi đó là bản multiplayer online. Phiên hiện tại chưa có dịch vụ Node/VPS để triển khai công khai.

## Giới hạn

Một tiến trình, SQLite local; chưa chia cụm máy chủ. 60 người/khu và 8 chỗ sạp là giới hạn prototype, không bảo đảm tải sản xuất. Chưa thu hồi sạp bỏ lâu, chưa cân bằng kinh tế, chưa có giao diện quản trị/phục hồi tài khoản bằng email. Cần quản trị viên xem báo cáo và vận hành sao lưu trước khi mở rộng cộng đồng.
