# TRIỂN KHAI GDD v0.1 — A đến E

Yêu cầu trực tiếp của chủ dự án cho phép bắt đầu triển khai theo từng đợt. Không coi phần đề xuất/chưa chốt trong GDD là tham số production đã duyệt.

## A — Ổn định beta (đang làm)
Đợt A1: thêm đo FPS, frame dài nhất trong giây, RTT ping WebSocket, biến thiên RTT và khoảng cách nhận snapshot. Ping đi trên chính socket game, không dùng HTTP để thay thế. Không đổi tiền, hàng hoặc schema persistent.
Các số đo là chẩn đoán tại thiết bị, không phải kết luận nguyên nhân lag. Tab chạy nền có thể bị trình duyệt giảm FPS; chỉ đo khi tab đang hiển thị.

Còn lại: đo server tick/CPU/RAM, thời gian SQLite, kích thước/tần suất payload, số draw calls/triangles; đo 1/3/6 người trên PC và Android. So sánh LAN với tunnel chỉ khi chủ dự án muốn mở tunnel. Sau đó tối ưu nút thắt và thử lại 6 người thật.

Rà soát ban đầu: server vẫn broadcast toàn khu mỗi 100ms; client tạo nhiều mesh/bóng đổ và nhãn DOM; render có cập nhật DOM thường xuyên. Đây là giả thuyết cần đo, chưa khẳng định là nguyên nhân. SQLite lưu đồng bộ có thể gây khựng khi thao tác kinh tế; cần đo trước khi thay lưu trữ.

## B — Vertical slice hàng rong
Chuỗi nhận mẹt → nhập 4 món beta → bày bán → giao dịch → sổ → mục tiêu xe. Hoàn thiện hướng dẫn theo sự kiện thật, không chỉ dựa vào trạng thái túi hiện tại. Tách metadata hàng dùng chung để UI không trùng giá. Thiết kế baseline giá vốn cho người cũ trước khi hiện lợi nhuận chính xác.

## C — Nghề và vị trí
Thử đặc tính gameplay cho bốn hàng hiện có. Đặc tả ca thuê, phí, kết ca và quyền sở hữu khác với điểm đặt sạp trước khi code. Không thu phí offline hoặc mất hàng.

## D — Bến Thành
Chỉ mở nội thất/phân khu sau khi A đạt trải nghiệm 6 người thật và B có vòng chơi hoàn chỉnh. Bảo toàn cấp sạp beta, migration có backup và test.

## E — Cộng đồng nâng cao
Đơn liên kết, hội chợ, khách đoàn theo từng đợt nhỏ; không spawn hàng loạt NPC đồ họa để mô phỏng nhu cầu server.

## Đo A1
1. Chạy local, vào nhân vật, chờ bảng số liệu góc dưới phải ổn định.
2. Ghi thiết bị/trình duyệt, FPS, frame max, ping, jitter và snapshot ở 1/3/6 người.
3. Đo đứng yên và di chuyển/mua bán riêng; ghi local/LAN/tunnel, không gộp kết quả.
4. Nếu FPS thấp nhưng ping ổn: điều tra render. Nếu FPS ổn nhưng ping/snapshot tăng: điều tra mạng/server. Cần đối chiếu server metrics để tách hai phía.
5. Chưa có bộ số liệu 6 người mới trong phiên triển khai này.

## Rollback A1
Bỏ script diagnostics trong HTML, bỏ route /diagnostics.js và nhánh ping/pong. Không cần sửa hoặc đặt lại database. Giữ nguyên backup dữ liệu và mọi tài sản beta.

## A1 — bổ sung đo phía máy chủ
Đã thêm metrics.js: CPU quy đổi một core, RSS RAM, event-loop p95 (cửa sổ từ lúc khởi động), thời gian save SQLite gần nhất/lớn nhất, thời gian vòng snapshot gần nhất/lớn nhất, tổng byte và số tin gửi. Số đo được trả cùng pong trên socket đã vào nhân vật; không kèm khóa phiên hoặc dữ liệu tài khoản. Byte gửi là tổng tích lũy, không phải băng thông/giây. Thời gian save gồm serialize và transaction, không phải thời gian từng câu SQL.
Khi bật số đo, vẫn chưa thể tự kết luận nguyên nhân lag. Chưa đo đủ draw calls/triangles và chưa có số liệu 1/3/6 người thật mới. Cần khởi động lại server để tải module mới; không tự mở tunnel.

Lộ trình chi tiết: 5 giai đoạn / 12 đợt: A1 đo, A2 tối ưu; B1 dữ liệu hàng/onboarding, B2 sổ/tiến trình; C1 nghề/khách, C2 quyền sở hữu/vị trí/ca; D1 nhà lồng/phân khu, D2 uy tín/thương hiệu; E1 hợp tác/khách đoàn, E2 hội chợ/buôn sỉ, E3 kiểm thử/vận hành, E4 playtest/bàn giao. Các quy tắc chưa chốt cần được xác định trước đợt liên quan.

### A1 — lấy báo cáo chẩn đoán
Trong game có nút “Xuất số đo A1”. Báo cáo JSON giữ tối đa 300 mẫu, khoảng một mẫu/giây khi tab đang hiển thị; có FPS/ping/jitter/snapshot, renderer counters và server metrics. Không chứa khóa phiên, mã khôi phục hoặc nội dung chat.
Để so sánh: mỗi người chơi xuất một báo cáo sau cùng thời lượng thử (ví dụ 2 phút); ghi riêng loại thiết bị, local/LAN/tunnel và hoạt động đứng yên/di chuyển/giao dịch. Không gộp báo cáo nhiều thiết bị thành một chỉ số FPS.
Kiểm tra giao thức: `node test/a1-probe.mjs` chạy server dữ liệu tạm ở cổng 15185, vào nhân vật rồi xác nhận pong/số đo; không dùng hoặc xóa dữ liệu thật.
Đã chạy probe thành công. Số đo probe khởi động không phải kết quả tải 6 người. Bảng đo và xuất file còn cần kiểm tra trực tiếp trên trình duyệt; chưa có nghiệm thu thiết bị Android hoặc nhóm 6 người mới.

## A2 — đợt 1: giảm cập nhật thừa
A1 được ghi là đã triển khai, chờ nghiệm thu theo quyết định chủ dự án. Chưa kết luận đạt hiệu năng 6 người.
A2 đợt 1: client giảm gửi move khi đứng yên (giữ heartbeat vị trí 2 giây); server không broadcast snapshot trùng trong mỗi tick (vẫn gửi định kỳ tối đa khoảng 2 giây khi yên); nhãn DOM cập nhật khoảng 20Hz; class và tiêu đề ngày/đêm chỉ cập nhật khi trạng thái đổi. Không thay đổi quy tắc kinh tế hoặc dữ liệu lưu.
Lưu ý đọc diagnostics: khi tất cả đứng yên, khoảng snapshot gần 2 giây là hành vi tiết kiệm mới, không tự xem là lag. Dùng ping/jitter và thử di chuyển để đánh giá mạng.
Còn lại A2: đo trước/sau với nhóm thật, tối ưu GPU/draw calls nếu xác nhận nghẽn, kiểm tra mobile và giao dịch đồng thời. Không coi đợt này là đã sửa xong lag.
Rollback: bỏ điều kiện vị trí trùng, bỏ snapshotCache, trả nhãn về cập nhật mỗi frame; không cần migration database.

## B1 — danh mục và hướng dẫn (đã triển khai, chờ kiểm tra giao diện)
Nguồn metadata hàng chính: public/catalog.js, dùng chung cho server, game.js, market.js và sổ. Giữ nguyên bốn mặt hàng và giá beta. Module community còn dùng bảng tên cho nội dung UI nhưng không quyết định giá.
Hướng dẫn lưu các mốc claimed/stocked/listed/sold trong hồ sơ; hồ sơ cũ được điền giá trị mặc định và suy ra mốc từ hàng/sạp/doanh số hiện có. Không cấp thưởng migration, không đặt lại tiền/hàng. Có nút từng bước mở đúng bảng nhập hoặc quản lý sạp.
Kiểm thử bổ sung: node --test test/onboarding.test.mjs. Rollback có thể bỏ UI và module hướng dẫn, giữ trường dữ liệu thêm; không xóa DB.
A2 tiếp tục hoãn theo yêu cầu chủ dự án. B2 tiếp theo cần đặc tả giá vốn theo món và baseline hàng beta trước khi hiện lợi nhuận chính xác; chưa thay giá nâng cấp hoặc phí thuê chưa chốt.

## B2 — giá vốn và sổ (đã triển khai phần mã)
Module accounting.js lưu ledger version 1, FIFO theo từng loại hàng và từng vị trí túi/sạp. Mua từ NPC, nhập đầu mối/xe ưu đãi, mua từ người chơi ghi giá thực trả. Bày/thu hồi/đóng sạp chuyển lô mà không sinh doanh thu. Bán NPC/người chơi ghi giá vốn lô đã bán. Giao đơn/đóng góp tách chi phí khỏi bán hàng; thưởng, thu đơn quán ăn và đầu tư ghi riêng.
Migration: hàng có trước mốc ledger được giữ số lượng và gắn giá vốn null. Không dựng lịch sử giả. Khi có hàng bán thiếu giá vốn, lợi nhuận bán hàng hiển thị chưa xác định; số liệu bắt đầu từ ledger.since, không dùng toàn bộ earned lịch sử để trừ purchases mới. Không đổi vốn/giá/cấp sạp, không đặt phí thuê.
UI: bổ sung Sổ giá vốn B2 và mục tiêu xe/sạp beta trong Sổ buôn bán. Công thức lợi nhuận bán hàng = doanh thu mới - giá vốn đã bán - chi vận hành, chỉ hiển thị số khi không có hàng bán thiếu giá vốn. Không gộp thưởng, đơn hàng, đầu tư vào con số này.
Kiểm thử: test/accounting.test.mjs kiểm FIFO, chuyển lô/thu hồi, legacy không phải miễn phí, migration lặp, từ chối thiếu lô và tách chi phí đóng góp. Còn kiểm tra giao diện và thử người thật. Rollback cần giữ trường ledger, không xóa dữ liệu; nếu chạy code cũ làm biến động hàng thì phải reconcile lô trước khi bật lại B2, không được giả định tiếp tục chính xác.

## C1 — cách bán và nhóm khách (đợt đầu)
Module public/professions.js dùng ở server; UI nhận tradeModes/profile từ server, không quyết định NPC mua. Người chưa chọn giữ luật beta. Chọn miễn phí, lưu profile.profession, không khóa nghề. Trái cây có lựa chọn theo xu hướng; cà phê theo phiên cao điểm xen kẽ; hoa theo trang trí; hàng ăn có nhóm khách vội/giá bình dân. Phản hồi cuối được lưu và hiển thị trong Nghề & khách. Các hệ số là thử nghiệm C1, chưa cân bằng bằng người thật.
Không thêm hư hỏng hàng, phí, hoặc tiền tệ mới. Tần suất NPC vẫn 30 giây. Bản này mới phân biệt quy tắc chấp nhận mua, chưa có hàng đợi/phục vụ khách hoặc AI di chuyển theo nghề. Cần playtest trước khi coi là đủ chiều sâu nghề.
Rollback: bỏ lựa chọn và dùng ngưỡng beta; giữ trường profession trong DB. Không mất hàng/xu. C2 tiếp theo cần chốt quy tắc ca và phí; không tự áp dụng thu hồi tài sản offline.

## C2 — quyền kinh doanh và ca thủ công
Đã tách profile.ownership (cấp/tên lâu dài) khỏi profile.stall (điểm bán/ca hiện tại). Hồ sơ beta có sạp được bảo toàn cấp/tên, ca legacy không tự hết hạn. Kết ca trả hàng và lô giá vốn về túi, giữ cấp. Mở lại ca dùng cấp đã sở hữu, không trả lại tiền mua cấp. Đổi vị trí chỉ trong khu hiện tại, chỉ khi đã thu hồi hàng, vị trí hợp lệ và không có chủ khác; server quyết định.
Giao diện nằm trong Sổ buôn bán, phần Quyền kinh doanh & ca bán. Ca C2 thử nghiệm miễn phí và kết thủ công; chưa áp đặt thời lượng, thu phí, thu hồi tự động hoặc mất chỗ khi offline. Đây là phần C2 an toàn đã có đặc tả; cơ chế thuê thời hạn có phí còn cần chốt trước khi triển khai.
Các ca đang offline vẫn giữ vị trí theo beta; muốn giải phóng cần kết ca. Tách ownership là nền để bổ sung phân bổ vị trí online sau này, không đồng nghĩa đã giải quyết hết chỗ.
Kiểm thử test/shifts.test.mjs: bảo toàn cấp/tên sang khu khác; không mở trùng; từ chối vị trí bận/ngoài giới hạn/còn hàng, không thay trạng thái khi từ chối. Rollback phải bảo toàn ownership vì profile.stall có thể null sau kết ca; không chạy code beta nhận lại cấp 0 nếu chưa chuyển ownership vào đường claim.

## D1 — nhà lồng nhỏ và bốn phân khu (đợt đầu)
Đã dựng khu nhà lồng mái mở để nhìn thấy nhân vật, nền/lối chính, cột và biển A trái cây, B hàng ăn, C hoa, D giải khát. Bốn quầy NPC dùng cùng catalog và luật mua hiện có. Chưa mở thêm món, phí, quyền thuê hoặc uy tín D2.
Cổng vào/ra dùng thông điệp hall; server kiểm khoảng cách tới cửa rồi gửi vị trí chuyển, cùng room WebSocket nên người cùng server vẫn nhìn thấy nhau nếu ở gần. UI Vào nhà lồng trước tiên đưa người tới cổng; bấm lại khi gần để chuyển. Trong hall bấm Ra sân chợ tương tự. Camera theo vị trí hall; giới hạn tọa độ mở rộng tới z=-64.
Không thay vị trí sạp người chơi hoặc dữ liệu tiền/hàng. Có rủi ro cần kiểm tra hình ảnh/góc camera/đường đi trên trình duyệt và mobile. Chưa nghiệm thu FPS hoặc thử 6 người. Server hiện chưa có toàn bộ va chạm kiến trúc authoritative; client giới hạn va chạm quầy hiện có. Không coi map mới là đã chống đi xuyên hoàn chỉnh.
Rollback: bỏ mô hình/cổng/UI và nhánh hall, đưa người trong hall về sân khi join (join hiện vốn spawn sân), phục hồi bounds cũ. Không cần xóa database.

## D2 — gian nhà lồng, thương hiệu, uy tín (đợt đầu)
Thêm bốn điểm bán trong nhà lồng (ô 9–12), giữ nguyên 8 ô sân chợ. Đường claim và relocate dùng giới hạn 12 chỗ trên server; UI chọn vị trí đọc slotCount. Cấp sở hữu beta được giữ. Chưa áp dụng phí hoặc điều kiện khóa gian theo uy tín.
profile.brand gồm tên, lời giới thiệu, điểm và số hoạt động từ mốc D2. Đơn quán ăn hoàn thành +3, phiên cộng đồng hoàn tất +5 cho người góp; đây là hệ số thử nghiệm, chưa cấp thưởng theo click hoặc giao dịch qua lại. Không suy ra uy tín lịch sử từ doanh số beta. Tên được kiểm độ dài/ký tự và đồng bộ ownership/stall; chưa có lọc nội dung theo ngữ nghĩa hoặc giao diện kiểm duyệt đầy đủ.
UI thương hiệu trong Sổ buôn bán. Chọn vị trí nhà lồng sau khi thu hồi hàng; vào nhà lồng qua cổng để giao dịch gần gian. Lời giới thiệu lưu và xem trong sổ chủ; chưa có trang giới thiệu thương hiệu cho khách. Chưa có nhóm khách cao cấp riêng hoặc quyền gian thương hiệu cấp 3–4.
Kiểm thử brand.test.mjs: migration uy tín bằng 0, tên giữ ownership, từ chối tên không hợp lệ, điểm theo hoạt động, đổi gian nhà lồng giữ cấp và không chiếm ô bận. Còn kiểm tra hình ảnh, đường đi, nhóm thật và bảng hiệu thương hiệu.
Rollback phải trả các ca ô 9–12 về ca kết thúc an toàn/trả hàng trước khi thu hẹp map; không bỏ mảng vị trí trong khi dữ liệu còn ô nhà lồng. Giữ brand/ownership/ledger, không reset DB.

## E1 — đơn liên kết và khách đoàn (đợt đầu)
Đơn chung theo từng khu, chu kỳ thử 10 phút, mỗi loại beta cần 3 món. Giao từ túi, thanh toán mỗi món vốn catalog +3 ngay; khi đủ đơn, mỗi hồ sơ đã góp nhận thêm 10 xu và một lượt uy tín cộng đồng. Thưởng chỉ xử lý trong lần chuyển complete=false sang true. Người solo có thể giao đủ, không yêu cầu kết bạn. Giá vốn giao hàng ghi ở nhóm chi khác, thanh toán đơn ở orderIncome, bonus ở rewards. Tiến độ lưu db.linkedOrders trong SQLite settings, tách chợ đêm cũ. Client gửi round và server từ chối phiên cũ.
Khách đoàn thử nghiệm: người chơi tự bật/tắt, mặc định tắt bảo toàn beta; 60 giây đầu mỗi chu kỳ 10 phút, NPC hiện có có thể mua tối đa 2 món/lượt nếu giá hợp luật nghề. Không tăng NPC đồ họa. Hệ số/thời lượng/thưởng là tham số playtest, chưa được cân bằng production.
UI Đơn liên kết và tùy chọn khách đoàn trong business-ui.js. Cập nhật thị trường định kỳ 30 giây để đổi phiên khi đứng yên; server vẫn kiểm thời gian thật tại thao tác. Chưa có mời riêng nhóm hoặc hợp đồng chia vai tự tạo.
Kiểm thử linked.test.mjs: solo hoàn thành, thưởng không lặp, khu tách biệt, từ chối thiếu hàng/số lượng/khóa bất hợp lệ và đổi vòng. Còn kiểm tra UI, nhiều người góp cùng lúc qua WebSocket, rớt mạng và tính cân bằng.
Rollback giữ linkedOrders/ledger, ngừng nhận đóng góp và khách đoàn; thanh toán đã nhận không bị thu hồi, không reset dữ liệu.

## E2 — hội chợ, mua sỉ và hồ sơ thương hiệu (đợt đầu)
Hội chợ thử xoay bốn chủ đề mỗi 15 phút theo server. Người có sạp và hàng đúng chủ đề đăng ký miễn phí; không thưởng xu từ nút đăng ký. Chỉ mục hội chợ hiển thị tên, lời giới thiệu, uy tín và nút ghé sạp. Dạo chợ hiển thị lời giới thiệu/uy tín thương hiệu.
Mua sỉ 2–20 món/lô, không tự đặt chiết khấu: tổng = số lượng * giá đang niêm yết. Client gửi phiên bản lô và giá nhìn thấy; server kiểm lại tồn kho, số nguyên, tiền đủ cả lô, cùng khu, khoảng cách và tự mua. Giá vốn FIFO chuyển theo lượng thực mua; doanh thu/sales/tiền cập nhật theo lô.
Mã yêu cầu mua sỉ chống xử lý lại cùng mã trong 100 yêu cầu gần nhất của phiên socket. Chưa phải idempotency bền qua reconnect/server restart; không tự retry giao dịch khi không rõ kết quả. Nút bấm mới hiện tạo mã mới nên hai lần bấm riêng có thể mua hai lô nếu còn tiền/hàng; cần bổ sung chặn pending trên UI ở đợt kiểm thử E3.
Kiểm thử fair.test.mjs: vòng chủ đề, validation lô/giá/version/tiền không mutate khi từ chối. Kiểm thử FIFO và bộ test kinh tế vẫn chạy. Còn kiểm thử WebSocket hai người tranh lô cuối, ngắt mạng, UI mobile, hội chợ thật và cân bằng kinh tế.
Rollback bỏ hội chợ/mua sỉ, giữ brand.fairRound và ledger, không thu hồi tiền/hàng giao dịch đã chốt. Chưa thêm phí hội chợ, chiết khấu bắt buộc, hoặc quầy 3D sự kiện mới.

## E3 — kiểm thử tích hợp và an toàn mua sỉ (đợt đầu)
Biên nhận wholesale chuyển sang profile.bulkReceipts, lưu trong cùng transaction SQLite với tiền/hàng của giao dịch. Mã cũ cùng fingerprint trả trạng thái hiện tại, không mua thêm; cùng mã khác nội dung bị từ chối. Giữ tối đa 10.000 biên nhận/hồ sơ rồi từ chối giao dịch mới, không tự xóa bằng chứng chống lặp. Biên nhận không đưa vào publicState. Đã có test giao thức thực cho lô cuối (một khách mua xong, khách khác bị từ chối), gửi lặp, đổi payload cùng mã, restart và gửi lại khi chủ sạp offline.
Lệnh npm test chạy tất cả test/*.test.mjs, không còn bỏ sót bộ B1/B2/C/D/E. npm run check quét cú pháp JS/MJS ở root/public/scripts/test.
Giới hạn còn lại: test lô cuối hiện kiểm hai yêu cầu nối tiếp, chưa mô phỏng mọi interleaving đồng thời. Cần thêm race test, sự cố ghi SQLite, test UI chống bấm lặp, reconnect khi mất ACK, và vận hành restore đầy đủ. Nếu save lỗi, mô hình in-memory hiện vẫn cần xử lý rollback/khôi phục; không coi đây là bảo đảm giao dịch production hoàn chỉnh.
Cân bằng kinh tế chưa nghiệm thu. Các hệ số nghề/hội chợ/đơn chung vẫn là thử nghiệm. Tối ưu và thử 6 người thật giữ ở cuối theo yêu cầu chủ dự án. Không tự mở tunnel hoặc production.

## E4 — bộ nghiệm thu và bàn giao
Đã tạo NGHIEM_THU_V0_1_E4.md với ma trận A–E, 14 kịch bản thử, phân công nhóm, mẫu báo lỗi và điều kiện chấp nhận bản v0.1. Không đánh dấu đã có playtest cộng đồng mới. Tối ưu/lag 6 người, UI mobile, race/lost ACK và sự cố lưu vẫn là các hạng mục cần xử lý/nghiệm thu, không bị che bởi kết quả test tự động.
Đợt E4 này không mở public tunnel hoặc production, không đặt lại dữ liệu. Chủ dự án có thể dùng tài liệu để tổ chức thử, gửi phản hồi rồi chạy vòng sửa và kiểm thử lại.

## Sửa lỗi localhost không vào game, không hiện cảnh
Nguyên nhân xác minh: tiến trình server cũ không có route /catalog.js mới; module import thất bại nên game.js không khởi tạo. Khởi động lại server đã phục hồi mô hình và thao tác vào nhân vật với tiến độ cũ. npm run dev đổi sang node --watch server.js để cập nhật server khi các module server đổi; npm start vẫn dành cho chạy thông thường. Sau cập nhật giao diện cần tải lại trình duyệt. Đã kiểm tra trực tiếp vào hồ sơ khách hiện có và cảnh 3D; chưa kiểm tra mã khôi phục tài khoản riêng trong lần sửa này.
