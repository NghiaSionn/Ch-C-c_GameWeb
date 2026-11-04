# BÀN GIAO VISUAL — MODEL, BỐI CẢNH, UI/UX CHỢ CÓC ONLINE

## 1. Mục tiêu bản thiết kế tiếp theo
Thiết kế một khu chợ Việt dễ thương, dễ đọc và dễ chơi trên PC/điện thoại. Người chơi nhìn vào hiểu mình là ai, sạp ở đâu và thao tác tiếp theo là gì. Giữ tinh thần chibi 3D, cảm giác đồ chơi, sinh hoạt Sài Gòn; lấy cảm hứng từ Bến Thành nhưng không sao chép tài sản hoặc dựng bản đồ 1:1.
Đây là tài liệu bàn giao để lên ý tưởng. Các bố cục và phong cách đề xuất dưới đây chưa được coi là thiết kế đã duyệt, không phải lệnh tự thay cơ chế hoặc giá.

## 2. Hiện trạng kỹ thuật cần biết
- Three.js 0.170.0; model được dựng bằng hình khối trong public/game.js (Box/Sphere/Cylinder/Cone), chưa có pipeline model GLB/rig/texture atlas chuyên nghiệp.
- Nhân vật chibi đầu lớn, mặt tối giản; áo nhiều màu, nón lá/khăn đầu; tay chân và emote dùng phép xoay mesh.
- Bối cảnh sân chợ, cổng đồng hồ, nhà phố, cây, bốn quầy NPC, sạp người chơi, góc hàng ăn và nhà lồng mái mở.
- Đèn ngày/đêm, bóng đổ directional, hemisphere light, đèn ấm, đèn lồng; có xem thử ánh sáng đêm chỉ phía client.
- UI HTML/CSS phủ lên canvas 3D, nhiều bảng được tạo thêm từ JavaScript. Không phải mọi nút đều nằm trong index.html.
- Cảnh 3D và nút vào game phụ thuộc module JS tải đúng. Đã từng trắng cảnh vì tiến trình server cũ không có route catalog.js; sửa visual cần kiểm tra console/network, không chỉ cú pháp.

## 3. Bản đồ file cho designer/developer
| File / hàm | Phụ trách |
|---|---|
| public/game.js: mesh/box/sphere/cylinder/sign | Hình khối, vật liệu màu, bảng hiệu canvas |
| public/game.js: person/applyCommunityOutfit/animateCommunity | Nhân vật, phụ kiện, emote |
| public/game.js: stall/decorateCommunityStall/updateStalls | Quầy NPC, model sạp người chơi, cấp và trang trí |
| public/game.js: frame/communityFrame | Camera, nội suy, nhãn DOM, render, chu kỳ ánh sáng |
| public/game.js: phần D1 và hallButton | Nhà lồng, biển khu, vào/ra |
| public/game.js: joystick/cameraTools/game-menu | Điều khiển chạm, zoom, menu |
| public/index.html | Màn vào game, header, túi, chat, bảng mua NPC |
| public/style.css | Màu, typography, responsive, nhiều lớp CSS bổ sung theo đợt |
| public/market.js | Sạp, nhập hàng, dạo chợ, mặc cả, mua lẻ/sỉ |
| public/community.js | Bạn bè, nhiệm vụ, cá tính, tài khoản, chợ đêm |
| public/business-ui.js | Sổ B2, hướng dẫn, nghề, ca/vị trí, thương hiệu, liên kết, hội chợ |
| public/catalog.js | Tên hàng, icon/emoji, mô tả và giá dùng chung; thay visual không tự sửa giá |
| public/feedback.js, public/diagnostics.js | Góp ý và số đo debug; cần đưa vào khu phụ khi thiết kế HUD |
| server.js / shifts.js | Vị trí hợp lệ, quyền ca, phạm vi mua; model phải khớp tọa độ gameplay |

Lưu ý: nhiều style inline trong JS và nhiều quy tắc CSS ghi đè. Khi thiết kế lại, nên gom thành component/class rõ ràng thay vì thêm lớp override tiếp. Đây là đề xuất refactor, chưa thực hiện trong đợt bàn giao.

## 4. Danh mục model / asset cần thiết kế
| Nhóm | Hiện có | Định hướng cần nghiên cứu |
|---|---|---|
| Nhân vật | Đầu cầu, thân đơn giản, tay chân rời | Silhouette rõ, tỷ lệ thống nhất, mặt vui, animation mềm, rig nếu cần |
| Trang phục | Màu áo, nón lá, khăn đầu | Đồ đời thường Việt, phụ kiện hợp nghề; không biến mọi người thành cùng một khuôn văn hóa |
| Mẹt/xe/sạp | Ba cấp beta, thay hình khối | Từng cấp có hình dễ nhận, kích thước và điểm tương tác chuẩn |
| Hàng | Xoài, bánh mì, cà phê, sen | Nhìn gần/xa đều nhận ra; cùng phong cách; tránh mỗi món một mesh riêng quá nhiều |
| Kiến trúc | Cổng đồng hồ, mái, nhà phố, nhà lồng | Một bộ module tường/cột/mái, bảng hiệu Việt, tỷ lệ theo nhân vật |
| Vật dụng | Rổ, cân, ghế, thùng, xe hàng, nồi | Chọn chi tiết kể chuyện, không đặt đồ trang trí che lối đi |
| Trang trí | Hoa, đèn lồng | Gắn vào socket chuẩn trên sạp, không đè nhân vật/biển giá |
| Icon/UI | Emoji, chữ và ký hiệu | Bộ icon đồng nhất; trạng thái rõ, không chỉ dùng màu |

Nếu xuất model: đề xuất GLB/glTF, scale và pivot thống nhất; bàn giao texture, vật liệu, nguồn chỉnh sửa, giấy phép, tên animation và điểm gắn phụ kiện. Poly/texture budget cần đo trước khi chốt, không tự đặt hàng loạt asset nặng.

## 5. Không gian và camera
Sân chợ là nơi khởi đầu; cổng dẫn tới nhà lồng có bốn phân khu. Hiện có 8 điểm sân và 4 điểm nhà lồng. Vị trí cấp sạp là dữ liệu gameplay, không tự dời model mà bỏ quên server.
Cần bản layout top-down có: vùng xuất hiện, lối đi, cổng, 12 điểm bán, quầy nhập hàng, góc hàng ăn, điểm hẹn và camera bounds. Ghi rõ kích thước nhân vật/lối đi và vùng chạm.
Camera hiện nghiêng nhìn từ trên, có zoom và đổi góc; khu nhà lồng có camera follow riêng. Cần kiểm tra mái che, nhãn trùng, nhân vật khuất, góc nhìn khi đứng sát quầy, xoay/zoom trên mobile.
Không mở rộng diện tích trước khi chứng minh tuyến đi hiện tại dễ hiểu. Có thể làm một góc phố đẹp và hoàn chỉnh trước.

## 6. Vấn đề UI/UX đã thấy trong bản prototype
- Nút chức năng được thêm theo từng đợt ở nhiều vị trí fixed; HUD dày và có nguy cơ trùng trên màn nhỏ.
- Nhiều panel có thể mở chồng; hệ thống đóng/mở chưa đồng nhất giữa mọi module.
- Một số chữ/nút nhỏ, card dài, cần cuộn; người mới dễ không biết bước tiếp theo.
- Biển sạp và tên người có thể đè nhau hoặc che cảnh; model vẫn chủ yếu hình khối thử.
- Chế độ debug/feedback hiện chiếm diện tích HUD, nên thu vào mục phụ.
- Tài khoản, hồ sơ khách và mã khôi phục cần giải thích ngắn, tránh tạo cảm giác bắt buộc đăng ký trước chơi.
- Màn hình còn chữ giai đoạn cũ; nhãn bản thử cần thống nhất sau khi thiết kế.
- Cần kiểm tra vùng joystick, chat, nút đóng bảng và bàn phím ảo; chưa có nghiệm thu mobile đầy đủ.

## 7. Cấu trúc UI đề xuất để lên concept
### HUD mặc định
Chỉ ưu tiên: tiền/túi nhỏ, mục tiêu hiện tại, tương tác gần nhất, chat thu gọn, menu và điều khiển. Các bảng nghề/hội chợ/sổ/thương hiệu đặt trong một menu rõ ràng, không thành dãy nút phủ cảnh.
### Ba đường thao tác chính
1. Nhập hàng: chọn món → số lượng → xem tổng vốn → xác nhận → phản hồi.
2. Mở bán: tới/nhận điểm → bày → giá → xem khách và tiến độ.
3. Quản lý: túi/sổ → ca/cấp sạp → thương hiệu/trang trí.
### Nguyên tắc tương tác
Một bảng chính tại một thời điểm; nút đóng và quay lại nhất quán. Mua sỉ cần tổng tiền rõ, trạng thái đang xử lý và không bấm lặp. Lỗi thiếu hàng/tiền/xa/đổi giá có hướng giải quyết, không chỉ toast biến mất.
Mobile ưu tiên bottom sheet, vùng chạm đủ lớn, chữ đọc được, khu vực an toàn hệ thống và bàn phím. PC có thể dùng panel cạnh; đừng phóng nguyên desktop xuống mobile.

## 8. Hướng mỹ thuật đề xuất (chưa chốt)
- Ấm, gần gũi: vàng kem kiến trúc, đỏ đất mái ngói, xanh lá/xanh ngọc điểm nhấn; màu hàng nổi khỏi nền.
- Vật liệu giản lược, bề mặt mềm, ánh sáng dễ đọc; tránh chi tiết nhỏ gây nhiễu.
- Ban đêm vẫn nhận ra đường, mặt người, nút tương tác; đèn làm điểm nhấn, không làm cảnh quá tối.
- Typography Việt hỗ trợ đầy đủ dấu; logo có cá tính nhưng chữ gameplay ưu tiên đọc nhanh.
- Bản sắc Việt qua vật dụng, cách bày hàng, bảng chữ và sinh hoạt; tránh rải nón lá/đèn lồng như vật trang trí duy nhất.
- Chuẩn bị 2–3 concept khác nhau trước khi chốt visual system.

## 9. Hiệu năng: dữ liệu bàn giao quan trọng
Báo cáo người dùng `cho-coc-a1-1793810607360.json`: 2 người, 10 mẫu khoảng 10 giây; viewport 1864×949, pixel ratio 1. FPS trung bình 55,3, thấp nhất 49. Khoảng 1.530–1.561 draw calls và ~112.000 tam giác/frame; 1.561 geometries được báo trong mẫu đầu. Ping quan sát 13,5–14,2 ms, server CPU 0–6% một core, RSS 128–131 MB. Đây là mẫu ngắn và không đại diện mọi máy.
Sáu người từng báo lag; chưa nghiệm thu lại. Không kết luận nâng server là đủ. Designer cần ưu tiên reuse mesh/material, instancing/batching, atlas, hạn chế bóng động và LOD/culling khi phù hợp. Mục tiêu ≥30 FPS Android tầm trung trong GDD là giả thuyết thử nghiệm, chưa đạt xác nhận.
FrameMax trong exporter hiện có lệch thời điểm reset nên đôi lúc 0; không dùng mẫu đó làm bằng chứng không giật. Số draw calls là renderer counters của lần render, cần đối chiếu shadow passes/cảnh thực tế trước tối ưu.
Không đánh đổi camera/map mới bằng hàng trăm mesh nhỏ. Các budget cụ thể phải đo trên thiết bị mục tiêu rồi chốt.

## 10. Ràng buộc giữ nguyên khi redesign
- Tiền, hàng, giá, ca, uy tín, quyền mua đều do server xác thực. Visual không tự cấp thưởng hoặc xác nhận giao dịch.
- Không reset SQLite hoặc xóa tài sản beta để làm lại cảnh.
- Catalog chỉ có 4 món MVP; thêm model nghề không tự tạo cơ chế nghề mới.
- Phí thuê và tiến trình cấp 3–4 chưa chốt; không vẽ UI như thể đã triển khai đầy đủ.
- Góp ý, chặn/báo cáo, thông báo lỗi và tiếp cận tài khoản phải còn tìm được.
- Public tunnel đã đóng trước đó; không bật khi chỉ làm concept.

## 11. Đầu ra mong muốn từ đợt thiết kế
1. Moodboard có nguồn/giấy phép và 2–3 hướng hình ảnh.
2. Style guide: màu, font, icon, spacing, card/button, trạng thái disabled/loading/error.
3. Sheet nhân vật: trước/ngang/sau, tỷ lệ, trang phục, emote.
4. Sheet mẹt/xe/sạp và 4 mặt hàng, phụ kiện/socket.
5. Layout map top-down và 3 góc camera gameplay.
6. Wireframe rồi mockup PC/mobile: vào game, HUD, nhập hàng, bày bán, mặc cả/mua sỉ, túi/sổ, menu.
7. Flow onboarding và trạng thái lỗi/mất mạng/đang xử lý.
8. Asset manifest: tên file, pivot/scale, material/texture, animation, nguồn, license và budget dự kiến.
9. Bản prototype nhỏ chạy thật trước khi thay toàn bộ map/UI.
10. Bảng mapping thiết kế → file/component để developer triển khai theo đợt.

## 12. Checklist nghiệm thu visual
- Người mới nhận ra nhân vật/sạp/mục tiêu và hoàn thành bán đầu không cần chỉ từng nút.
- Đọc được tiếng Việt, giá/tổng tiền/trạng thái giao dịch rõ.
- Không chồng panel, nút bị che, hàng/biển hiệu đè nhân vật hoặc click xuyên.
- Chơi được trên 390px, kiểm bàn phím ảo, joystick và xoay màn hình.
- Ban ngày/đêm đều đọc được đường và tương tác.
- Có số đo FPS/draw calls/frame time trước–sau trên cùng máy và 6 người thật.
- Không mất tài sản/progress; giao dịch vẫn qua server; không chỉ nghiệm thu ảnh tĩnh.

## 13. Prompt bàn giao dùng cho bước lên ý tưởng
“Hãy đọc tài liệu visual này cùng GDD và nhật ký A–E. Đề xuất 2–3 concept chợ Việt chibi 3D và UI/UX thân thiện cho PC/mobile, ưu tiên ít nút, dễ hiểu và tiết kiệm draw calls. Trả về moodboard, style guide, map layout, sheet nhân vật/sạp, flow người mới, mockup các màn chính và backlog theo đợt. Phân biệt đề xuất với tính năng đang có; chưa tự sửa luật kinh tế, dữ liệu hoặc asset khi mới lên concept.”
