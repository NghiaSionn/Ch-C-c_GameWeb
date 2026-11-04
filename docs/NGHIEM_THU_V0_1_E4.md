# E4 — Bàn giao v0.1 và kế hoạch nghiệm thu

## Trạng thái phát hành
Bản hiện tại là prototype tích hợp A–E, chưa phải v0.1 đã nghiệm thu đầy đủ. Có mã và kiểm thử tự động cho nhiều cơ chế; chưa có kết quả kiểm tra trình duyệt/mobile đầy đủ cho toàn bộ thay đổi gần đây. Không mở tunnel hoặc production trong đợt E4 này.

## Ma trận nghiệm thu
| Đợt | Có trong mã | Cần nghiệm thu tiếp |
|---|---|---|
| A1 | FPS/ping/jitter, renderer/server metrics, xuất JSON | Xác minh bảng đo, mẫu 1/3/6 người thật |
| A2 | Giảm snapshot/move/DOM thừa | Tối ưu và thử tải đồ họa cuối dự án; lỗi lag chưa kết luận đã sửa |
| B1 | Catalog dùng chung, hướng dẫn lưu mốc | Onboarding người mới, màn hình điện thoại |
| B2 | FIFO túi/sạp, giá vốn, thưởng/đầu tư riêng | Kiểm giao diện, sự cố ghi dữ liệu, cân bằng |
| C1 | Cách bán bốn nhóm hàng, phản hồi NPC | Chiều sâu nghề, hệ số còn thử nghiệm |
| C2 | Ownership, ca thủ công, đổi ô | Phí/thời lượng chưa chốt, chưa tự giải phóng offline |
| D1 | Nhà lồng, cổng và bốn phân khu | Góc nhìn, đường đi, va chạm, mobile |
| D2 | Bốn gian nhà lồng, thương hiệu/uy tín | Quyền cấp 3–4, khách cao cấp, điều kiện thuê chưa làm |
| E1 | Đơn liên kết, khách đoàn bật tùy chọn | Góp hàng nhiều người đồng thời, cân bằng |
| E2 | Hội chợ chủ đề, chỉ mục thương hiệu, mua sỉ | UI chống bấm lặp, lost ACK và race |
| E3 | Biên nhận mua sỉ bền, bộ test chung | Rollback in-memory khi lưu lỗi, phục hồi dịch vụ end-to-end |
| E4 | Checklist, mẫu báo lỗi, rà soát test | Buổi thử người thật và vòng sửa theo phản hồi |

## Chuẩn bị một buổi thử
1. Sao lưu bằng `node scripts/backup.mjs`; giữ backup riêng, không đưa DB/token vào báo lỗi.
2. Chạy `npm run check` và `npm test`. Chạy `node test/a1-probe.mjs` để kiểm số đo server.
3. Chạy local bằng `npm run dev`. Chỉ mở public tunnel khi chủ dự án yêu cầu riêng.
4. Dùng hồ sơ thử mới cho kiểm tra kinh tế; không reset dữ liệu người chơi cũ.
5. Phân công 6 người: 2 người mới, 2 người kinh doanh, 1 người thử mobile, 1 người ghi nhận.

## Kịch bản nghiệm thu người thật
| ID | Thao tác | Mong đợi |
|---|---|---|
| PT01 | Nhận mẹt → nhập → bày → bán | Người mới hoàn thành không cần chỉ từng nút; ghi thời gian |
| PT02 | Mua giá khác nhau, bày/thu hồi rồi bán | Giá vốn đúng lô; tồn kho chưa bán không trở thành COGS |
| PT03 | Đăng nhập hồ sơ beta thiếu giá vốn | Giữ tiền/hàng/cấp; sổ ghi giá vốn chưa rõ |
| PT04 | Mua trực tiếp, mặc cả nhiều lượt | Chỉ chốt khi đủ tiền/hàng và đúng lượt/khoảng cách |
| PT05 | Hai khách mua lô cuối cùng lúc | Chỉ giao đủ lô cho bên thành công; không âm hàng/nhân đôi |
| PT06 | Mất mạng sau gửi mua sỉ rồi vào lại | Không mua trùng cùng requestId; xác nhận tồn kho trước thao tác mới |
| PT07 | Kết ca → mở lại → chuyển nhà lồng | Giữ cấp/tên/lô hàng; không chiếm ô đã có chủ |
| PT08 | Vào/ra nhà lồng và ghé gian bạn | Camera/đường đi đúng; server kiểm khoảng cách giao dịch |
| PT09 | Chọn nghề, đổi thời điểm/trang trí/giá | NPC phản hồi theo luật và không tự sinh hàng |
| PT10 | Góp đơn liên kết đủ nhiều người | Thanh toán từng phần; thưởng hoàn tất chỉ một lần |
| PT11 | Hội chợ đổi phiên, đăng ký đúng hàng | Không thưởng từ đăng ký; danh sách đúng phiên |
| PT12 | Tài khoản, bạn bè, chặn, báo cáo | Khôi phục đúng tiến độ; chặn đúng người; không lộ mã khôi phục |
| PT13 | Dừng server → chạy lại → phục hồi backup vào data-dir mới | Giữ tiến độ và đối chiếu số dư; không ghi đè DB đang mở |
| PT14 | 1/3/6 người đứng yên, đi lại, giao dịch | Xuất báo cáo A1 từng máy, ghi FPS/ping/jitter và thời điểm khựng |

## Mẫu ghi lỗi
- Mã lỗi / ngày thử:
- Thiết bị, trình duyệt, PC/Android/iOS:
- Local / LAN / tunnel:
- Hồ sơ mới hay beta (không ghi token):
- Đang làm gì, các bước lặp lại:
- Mong đợi / thực tế:
- Số tiền và hàng trước/sau (chỉ dữ liệu thử được phép chia sẻ):
- FPS/ping và file A1 (không chứa account secrets):
- Tần suất, ảnh/video nếu có:
- Mức độ: P0 mất/nhân đôi tài sản, P1 không chơi được, P2 khó dùng, P3 thẩm mỹ.
- Người xử lý / kết quả thử lại:

## Điều kiện gọi v0.1 đạt nghiệm thu
- Không còn P0/P1 đã biết chưa xử lý.
- Giao dịch đồng thời, gửi lặp và reconnect đã thử thực tế.
- Dữ liệu beta được bảo toàn; đã phục hồi dịch vụ từ backup trong môi trường thử.
- Nhóm 6 người có số liệu sau tối ưu, không chỉ kết nối mô phỏng.
- Người mới chơi vòng đầu được và hiểu sổ doanh thu/giá vốn.
- Các giá/thuê/uy tín thử nghiệm được chốt hoặc ghi rõ chưa thuộc bản phát hành.

## Lưu ý vận hành
`npm test` quét test/*.test.mjs. `npm run check` kiểm các module JS/MJS. Phiên bản package hiện vẫn 0.3.0 từ prototype; GDD v0.1 là phiên bản thiết kế, không đổi số để ngụ ý đã nghiệm thu.
Tài liệu chi tiết: KE_HOACH_GDD_A_E.md và BAN_GIAO_CO_CHE_VA_PLAYTEST.md. Không coi E4 là đã có buổi thử cộng đồng khi chưa nhận/quan sát báo cáo thực tế.
