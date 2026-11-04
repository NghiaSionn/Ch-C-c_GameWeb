# CHỢ CÓC ONLINE — TASK TRIỂN KHAI UI/UX ĐỂ KIỂM TRA TRONG GAME

**Mã tài liệu:** CC-UIUX-001  
**Phiên bản:** 1.0 — chốt từ các mockup đã duyệt trong buổi trao đổi  
**Mức ưu tiên:** P0 (HUD vào game) → P1 (4 panel đã duyệt) → P2 (kiểm tra responsive / polish)  
**Loại công việc:** Chỉnh sửa giao diện đang chạy, **không phải viết lại game**  
**Người thực hiện:** Codex làm trực tiếp trên repository `ChoCocOnline`  
**Mục tiêu giao hàng:** Chủ dự án có thể chạy `npm run dev`, vào nhân vật và **thử HUD mới cùng 4 bảng đã duyệt trên game thực tế**.

> **QUAN TRỌNG:** Những ảnh đã tạo trong hội thoại là **mockup tham chiếu về bố cục và mỹ thuật**, không phải ảnh chụp tính năng hiện có. Các con số, cấp nhân vật, chart, khả năng thuê/nâng cấp và nút cộng xu trên mockup chỉ mang tính minh họa. **KHÔNG** tạo dữ liệu giả hoặc tự thêm gameplay để khớp ảnh.

---

## 0. CHỈ DẪN THỰC THI CHO CODEX

1. Đọc tài liệu này, đối chiếu **source code thực tế** trước khi sửa. Nên tham khảo các tài liệu bàn giao (nếu chúng có trong repo):
   - `BAN_GIAO_VISUAL_MODEL_UI_UX.md`
   - `BAN_GIAO_CO_CHE_VA_PLAYTEST.md`
   - `NGHIEM_THU_V0_1_E4.md`
   - `CHO_COC_ONLINE_GDD_V0_1_CODEX.md`
2. **Không hỏi phải thiết kế lại UI theo phong cách nào.** Bố cục và phong cách đã được duyệt trong các mockup. Dùng phần **Visual Contract** ở mục 2 làm đặc tả khi không có ảnh trong repo.
3. Không được thay đổi luật server, kinh tế, giá, tồn kho, database, vị trí sạp, quyền giao dịch, networking hoặc core game mechanics chỉ để UI trông khớp concept.
4. **Không tạo màn mockup giả thay thế game thật.** UI phải nằm trên canvas Three.js thật, lấy dữ liệu live và gọi handler thật của project.
5. **Thực hiện theo mốc độc lập:**
   - **MỐC A (bắt buộc đầu tiên):** Chỉnh HUD màn gameplay khi vừa vào nhân vật. Sau mốc này phải có giao diện chạy để chủ dự án chụp ảnh, đánh giá.
   - **MỐC B:** Áp dụng bộ UI đã duyệt cho 4 panel: Nhập hàng, Quản lý sạp, Túi đồ, Sổ kinh doanh; dùng chức năng hiện có và state thật.
   - **MỐC C:** Responsive, trạng thái lỗi/loading, kiểm tra regression, báo cáo.
   - Nếu môi trường làm việc có quy trình duyệt từng mốc, dừng sau **MỐC A** và báo cáo cách kiểm tra trước khi làm tiếp. Nếu triển khai liền một lượt, vẫn phải để A là checkpoint/commit riêng và liệt kê kết quả A/B/C tách biệt.
6. **Không mở public tunnel, không deploy production, không reset dữ liệu** khi làm UI.
7. Tất cả nút nhìn như có thể bấm phải dẫn đến chức năng có thật; nếu backend/feature chưa tồn tại, **ẩn hoặc disabled có giải thích**, tuyệt đối không giả lập “thành công”.

---

## 1. HIỆN TRẠNG VÀ GIỚI HẠN PHẠM VI

### 1.1. Stack và các file cần rà soát

Dự án là Node.js + WebSocket + SQLite + Three.js 0.170.0, UI HTML/CSS overlay canvas. Nhiều panel được dựng động bằng JavaScript; không được chỉ xem `public/index.html`.

| Khu vực | Vị trí được tài liệu bàn giao nhắc tới | Công việc |
|---|---|---|
| Canvas, camera, HUD gameplay | `public/game.js`, `public/index.html`, `public/style.css` | Bố cục overlay và luồng input, không sửa model/camera nếu không cần |
| Nhập hàng, mua bán, mặc cả, sạp | `public/market.js` | Gắn view mới vào handler và dữ liệu hiện có |
| Sổ, nghề, ca, vị trí, hướng dẫn | `public/business-ui.js` | Re-layout panel; giữ logic |
| Nhiệm vụ, tài khoản, bạn bè, chợ đêm | `public/community.js` | Giữ nơi truy cập các chức năng khi gọn HUD |
| Catalog | `public/catalog.js` | Đọc tên hàng/giá/icon chuẩn, không đổi giá |
| Diagnostics, feedback | `public/diagnostics.js`, `public/feedback.js` | Đưa khu vực phụ, không xóa |
| Server | `server.js`, `shifts.js` | Chỉ đọc contract/handler; tránh thay đổi nếu không có bug riêng được xác nhận |

**Lưu ý kỹ thuật:** Đã từng có tình huống vào game bị trắng cảnh do thiếu route/module `catalog.js`. Sau mỗi thay đổi cần kiểm tra DevTools Console + Network, không chỉ chạy `npm run check`.

### 1.2. Trong phạm vi vòng này

- Màn gameplay fullscreen trong viewport trình duyệt (không bắt buộc bật Browser Fullscreen API).
- HUD tổng, hệ thống nút chính, vị trí chat/nhiệm vụ, panel được mở bằng nút.
- Bốn panel **đã có concept được duyệt**: Nhập hàng, Quản lý sạp, Túi đồ, Sổ kinh doanh.
- Trạng thái panel: mở, đóng, loading, lỗi, disable, thành công; desktop và mobile.
- Hướng dẫn tối thiểu: chỉ mục tiêu hiện tại/trợ giúp vào đúng chỗ, không làm lại toàn bộ hệ thống tutorial trong vòng này.

### 1.3. Ngoài phạm vi — KHÔNG tự làm

- Thay/cải tạo toàn bộ 3D map, nhân vật, mô hình sạp, shader, ánh sáng.
- Thêm hàng mới hoặc nghề mới; **catalog MVP có 4 món**: xoài, bánh mì, cà phê và hoa (tài liệu khác gọi hoa sen, phải đọc tên chính thức từ catalog).
- Thêm hệ thống cấp độ XP nếu game chưa có. Thanh Lv.3/XP trong ảnh chỉ là concept.
- Thêm hệ thống mua/nạp xu khi chưa có. Nút `+` cạnh số dư trên mockup không đồng nghĩa tính năng nạp tiền.
- Thêm giao dịch, quyền thuê cấp 3–4, cấp sạp, kho, sức chứa túi hay biểu đồ lịch sử 7 ngày nếu dữ liệu/logic chưa hỗ trợ.
- Xóa nút chức năng mà không bảo toàn đường truy cập; tắt/bỏ hướng dẫn game, xóa góp ý/báo cáo/khôi phục tài khoản.
- Dùng ảnh mockup full-screen làm background tĩnh thay canvas game thật.

---

## 2. VISUAL CONTRACT — PHONG CÁCH ĐÃ DUYỆT

### 2.1. Nền game

- **Giữ gameplay 3D phủ toàn bộ viewport**, không thêm thanh sidebar cố định rộng làm canvas bị thu nhỏ.
- UI là overlay nổi, gọn, thoáng. Cảnh chợ, nhân vật và lối đi vẫn nhìn thấy.
- Giữ chất chibi Sài Gòn, gam kem ấm, cam đất, nâu gỗ, xanh lá cho nút xác nhận và vật phẩm.
- Không tạo mesh 3D bổ sung để làm UI. UI bằng HTML/CSS/SVG/icon tái dùng; ảnh minh họa món hàng dùng tài sản đã được phép sử dụng/đang có hoặc icon hiện tại.

### 2.2. Token CSS tham khảo (đề xuất, tinh chỉnh theo màn hình thật)

```css
:root {
  --cc-cream: #fff4da;
  --cc-panel: #fff0d4;
  --cc-panel-soft: #ffead0;
  --cc-border: #daac70;
  --cc-brown: #593219;
  --cc-wood: #a86634;
  --cc-orange: #ef9653;
  --cc-green: #299b39;
  --cc-green-dark: #18782a;
  --cc-danger: #c94d37;
  --cc-muted: #836b52;
  --cc-shadow: 0 10px 28px rgba(54, 31, 12, .20);
  --cc-radius-panel: 24px;
  --cc-radius-card: 16px;
  --cc-radius-button: 14px;
  --cc-touch-min: 44px;
}
```

Đây là **gợi ý thẩm mỹ**, không phải bắt buộc dùng chính xác mọi mã màu. Tạo class/token chung để hạn chế CSS override chồng lớp và inline style từ nhiều module.

### 2.3. Thành phần chung

- Panel kem sáng, viền vàng nâu nhẹ, đổ bóng vừa đủ; tiêu đề kiểu bảng gỗ và viền trang trí **mái bạt đỏ/kem** giống các ảnh đã duyệt.
- Tab pill bo tròn, tab đang chọn **xanh lá**; button xác nhận xanh, button nguy hiểm (đóng ca/thu hồi) màu nhạt/đỏ với hộp xác nhận khi cần.
- Card sản phẩm: ảnh/icon bên trái, thông tin chữ ở giữa, điều khiển bên phải; trên mobile xếp dọc.
- Icon cùng một bộ phong cách, không lạm dụng emoji lẫn nhiều hệ icon khác nhau; không tải font/icon nặng nếu có thể tái dùng.
- Font Unicode hiển thị dấu tiếng Việt rõ; chữ cần tương phản cao; chữ mô tả trên màn nhỏ không quá nhỏ.
- Một modal chính mỗi lần; UI chồng lớp theo thứ tự **3D → HUD → backdrop → modal → confirm dialog → toast**.

---

## 3. MỐC A — HUD FULLSCREEN NGAY KHI VÀO GAME (ƯU TIÊN SỐ 1)

### 3.1. Contract layout desktop

**Tọa độ mang tính định hướng trên viewport 16:9, không hardcode theo ảnh 1648×928.** Dùng Flex/Grid/anchor, gap và `clamp()` để có thể co giãn.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Avatar + tên / cấp nếu có] [         Sài Gòn 01 · số người       ] [Xu][icons]│
│                                                                              │
│ [SỔ KINH DOANH]                                    [Nhiệm vụ hiện tại]       │
│ [NHIỆM VỤ]                                          [• Mục tiêu 1]           │
│ [SỰ KIỆN]                                           [• Mục tiêu 2]           │
│                                                                              │
│                         CANVAS THREE.JS / THẾ GIỚI CHỢ                      │
│                                                                     [+]      │
│                                                                     [-]      │
│                                                                  [Bản đồ]    │
│                                                                              │
│ [Chat gần, thu gọn]                        [Nhập][Sạp][Túi][Giao dịch]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### A1. Trên trái — hồ sơ nhân vật

- **BỎ logo/bảng “Chợ Cóc Online” nổi ở góc trên trái**.
- **DỜI card nhân vật sát cạnh trái**, có padding an toàn khoảng 12–16px.
- Nội dung: avatar (nếu có), tên nhân vật thực, vai trò/danh hiệu/cấp **chỉ khi dữ liệu tồn tại**.
- Nếu chưa có level/XP thật: dùng thông tin hiện có như tên + tình trạng sạp; **không vẽ Lv.3 / 120/300 giả**.
- Không che khu cổng chợ quá nhiều.

#### A2. Cột trái — chỉ 3 nút

Thứ tự **chính xác**:

1. `Sổ kinh doanh`
2. `Nhiệm vụ`
3. `Sự kiện`

**Xóa khỏi HUD:** `Trang chủ`, `Cộng đồng`, `Hướng dẫn` (nếu đang xuất hiện là nút đứng riêng).  
**Đổi nhãn:** `Sự kiện Hội chợ` → **`Sự kiện`**.  
Không xóa chức năng bên dưới: tài khoản/cộng đồng/bạn bè/báo cáo/hướng dẫn vẫn tìm thấy từ menu phù hợp (ví dụ icon bạn bè, cài đặt, tab nhiệm vụ).

Thiết kế: ba nút hình capsule/card kem, có icon ở trái, khoảng cách đều; chỉ hiện chấm đỏ khi có dữ liệu thông báo cần chú ý. **Không hardcode dấu !** như ảnh concept.

#### A3. Giữa trên — khu chơi

- Card nhỏ hiển thị khu hiện tại (`Sài Gòn 01` hoặc khu thật) và số người hiện có nếu server cung cấp.
- Không gán cứng `12/60` lấy từ mockup.
- Không đè biển khu `Trái cây - Nông sản` / `Hàng ăn Sài Gòn` trong cảnh nếu cảnh có nhãn tương ứng.

#### A4. Trên phải — số dư và tiện ích

- Số xu **live**, cập nhật từ state/server (ví dụ screenshot có 136 xu nhưng giá trị thật là tùy hồ sơ).
- Icon chuông thông báo, thư/lời mời, bạn bè, cài đặt chỉ gắn vào những chức năng đã có. Nếu không có chức năng tương ứng, đừng dựng nút vô hiệu không giải thích.
- **Không tạo nút `+ xu` để nạp xu** khi chưa có mô hình nạp tiền; có thể bỏ hoặc thay bằng action trợ giúp về cách kiếm xu, với nhãn rõ.
- Cài đặt phải cho truy cập lại **trợ giúp, góp ý, diagnostics/debug ở khu phụ**, và phần tài khoản/khôi phục nếu đang có.

#### A5. Trên phải, thấp hơn thanh tiện ích — tracker nhiệm vụ

- Card `Nhiệm vụ hiện tại`, hiển thị tối đa 2–3 mục tiêu ngắn, số tiến độ thật từ quest/onboarding hiện có.
- Không hardcode: `Nhập 3 món`, `Bán 3 món` nếu người chơi đã hoàn thành hoặc đang ở bước khác.
- Click tracker → mở đúng màn `Nhiệm vụ`/mục tiêu đang xem.
- Nếu chưa có mục tiêu hoạt động: trạng thái trống có thông điệp ngắn `Chưa có nhiệm vụ đang theo dõi` hoặc ẩn card để giữ thoáng.
- Trên màn nhỏ card rút gọn được.

#### A6. Giữa phải — camera / bản đồ

- Giữ điều khiển `+` / `−` zoom và `Bản đồ` như trong mockup, chỉ khi game đang có handler tương ứng.
- Đặt theo cột, không đè mission tracker hoặc quick buttons.
- Không sửa camera gameplay, không đổi coordinate/raycast.

#### A7. Dưới trái — chat / trạng thái chợ đêm

- Giữ chat gần và thông báo chợ đêm, nhưng **chat thu gọn** mặc định nếu không có tin; đủ chỗ nhập và gửi khi mở.
- Không chiếm khu vực trung tâm, không đè joystick ở mobile.
- Nút emoji / gửi sử dụng handler hiện hữu, có focus state; không để gõ chat khiến nhân vật di chuyển bằng WASD.

#### A8. Dưới phải — đúng 4 quick actions

Theo thứ tự:

1. `Nhập hàng`
2. `Quản lý sạp`
3. `Túi đồ`
4. `Giao dịch`

- Icon lớn + nhãn 1–2 dòng, cùng kích thước, trạng thái active khi panel tương ứng mở.
- **KHÔNG tạo đường tắt giao dịch trái server:** nút `Nhập hàng` chỉ mở panel theo đúng luật và điều kiện hiện có; nếu cần đứng gần NPC/quầy, chỉ hướng dẫn đi đến điểm nhập, không gửi mua từ xa.
- `Giao dịch` mở luồng mua/mặc cả hiện có hoặc hướng dẫn chọn sạp gần đó khi chưa đủ điều kiện.
- Chạm liên tục không tạo nhiều instance panel hoặc nhiều request.

#### A9. BỎ hướng dẫn di chuyển ở dưới giữa

- **Loại bỏ thanh nổi dạng `E / Chạm vào mặt đất để di chuyển`** đã được chủ dự án đánh dấu xóa khỏi thiết kế HUD.
- **Chỉ xóa UI thường trực này**, tuyệt đối không phá input di chuyển, joystick, bàn phím, tương tác bằng `E` nếu game đang dùng.
- Nếu cần tutorial di chuyển cho tài khoản mới, hiển thị trong luồng onboarding ngắn hoặc mục trợ giúp, không để trụ mãi trên HUD.

### 3.2. Không được “bỏ nhầm”

- **Biển CHỢ CÓC trên tòa nhà/cổng 3D vẫn giữ.** Chỉ bỏ bảng logo nổi ở UI góc trái.
- Giữ mọi tuyến vào nhà lồng, tương tác NPC, biển sạp, quy tắc vị trí, chat, kho/tiền, thông báo lỗi.
- Hình minh họa HUD có icon quà, EXP, badge cảnh báo — phải đối chiếu hệ thống thật trước khi hiện.

### 3.3. Kết quả cần đạt ở cuối MỐC A

- Vào `http://localhost:5180` → vào nhân vật → canvas vẫn full viewport, HUD mới xuất hiện đúng bố cục.
- Cột trái chỉ đúng ba nút nói trên, không có logo UI, Trang chủ, Cộng đồng, Hướng dẫn độc lập.
- Avatar sát trái, không còn thanh hướng dẫn di chuyển ở giữa dưới.
- Dưới phải 4 nút có handler, click phản hồi rõ, mở đúng panel thật hiện có (chưa cần hoàn tất style panel ở Mốc A).
- Người chơi vẫn đi, zoom, vào nhà lồng, chat, xem nhiệm vụ.
- Chủ dự án chụp ảnh **HUD khi không mở panel** để duyệt trước khi tiếp tục.

---

## 4. MỐC B — 4 PANEL ĐÃ DUYỆT (KHÔNG TỰ THIẾT KẾ THÊM PANEL KHÁC)

### 4.1. Quy tắc chung cho mọi panel

- Desktop: panel nằm **giữa viewport**, max width khoảng `950–1100px` khi đủ chỗ; tối đa `min(92vw, ...)`; height phù hợp, nếu dài thì cuộn vùng nội dung, không cắt nút xác nhận.
- Có backdrop nhẹ làm tối thế giới, **canvas vẫn hiện dưới UI**; không đóng render loop khi mở bảng nếu gây lỗi networking/scene.
- Header nhất quán: icon theo chức năng, tên panel, mô tả 1 dòng, nút `X` trên phải.
- Nội dung dùng 2 cột khi cần; các tab ở ngay dưới header; vùng hành động hiển thị rõ.
- `Esc` đóng panel nếu không có dialog xác nhận đang mở; trên mobile có nút đóng dễ chạm.
- Mỗi lần chỉ một panel lớn active. Bấm quick action khác sẽ chuyển panel, không chồng lên nhau.
- Click vào modal không gây click xuyên vào canvas 3D. Khi focus form, camera/di chuyển không phản ứng với phím gõ; trả focus hợp lý khi đóng.
- Mọi kết quả giao dịch chỉ hiển thị **thành công sau khi server phản hồi thành công**.

### 4.2. B1 — Panel `Nhập hàng`

**Bố cục duyệt:** header mái bạt; bên trái là danh sách mặt hàng, bên phải là `Giỏ nhập hàng`.

**Tab/bộ lọc:** `Tất cả`, `Trái cây`, `Đồ ăn`, `Nước uống`, `Hoa`. Chỉ hiển thị loại đang có hàng; giữ khả năng mở rộng mà không thêm món.

**Mỗi card hàng cần có:**

- Hình/icon nhận diện; tên món từ catalog; mô tả ngắn nếu có.
- **Giá nhập thật**, **giá tham khảo thật** từ catalog/server; không hardcode giá trên ảnh concept.
- Trạng thái nhu cầu (`Đang chuộng`, `Bình thường`...) chỉ khi hệ thống đang có dữ liệu thật.
- Bộ tăng/giảm số lượng, tối thiểu 0, giới hạn theo quy tắc hiện tại; không cho giá trị âm/NaN.

**Giỏ bên phải cần có:** tên món + số lượng + thành tiền, tổng số món, tổng vốn cần, xu hiện có; nút `Xác nhận nhập hàng`.

**Hành vi:**

- Tổng được tính từ giá chính xác trong state hiện tại; server vẫn là nguồn quyết định số tiền thực.
- Disable xác nhận khi giỏ trống/không đủ xu/yêu cầu đang xử lý hoặc không thỏa điều kiện tương tác; giải thích rõ lý do.
- Khi server báo giá thay đổi/không đủ tiền/hết vị trí hợp lệ, hiển thị lỗi gần nút và cung cấp cách xử lý.
- Khi thành công cập nhật số dư + hàng/tồn kho theo dữ liệu trả về; reset số lượng đã mua hợp lý, không mua lại do double-click.

**Tuyệt đối không:** dùng giá trong mockup `8/15`, `10/18`, `9/16`, `12/22` để thay dữ liệu server.

### 4.3. B2 — Panel `Quản lý sạp`

**Tab đã duyệt:** `Sạp của tôi` | `Bày bán` | `Nâng cấp` | `Trang trí`.

**Sạp của tôi**:

- Hình minh họa sạp tương ứng cấp thật (có thể dùng icon/ảnh UI nhẹ; không cần dựng model mới).
- Tên loại sạp, khu/vị trí, tình trạng ca (`Đang mở`, `Chưa mở`, `Đã kết ca`), sức chứa và số hàng đang bày lấy từ state.
- `Đóng ca`, `Đổi vị trí` chỉ hiện/enable theo quyền thực tế.
- Khu `Hiệu quả hôm nay` hiển thị doanh thu, giá vốn hàng bán, lãi **nếu dữ liệu cho phép**; có nhãn `ước tính` cho chỉ số không phải lợi nhuận kế toán đầy đủ.

**Bày bán**:

- Danh sách hàng trong túi đủ điều kiện bày, hàng đang bày, số lượng, giá bán và giới hạn sạp.
- Dùng action bày/thu hồi/sửa giá hiện có, kiểm tra giới hạn, không tự sinh hàng.

**Nâng cấp**:

- Hiển thị lộ trình khi có cấp/quyền hỗ trợ trong server; chỉ bật nút mua/thuê nếu backend hỗ trợ và đã được chốt.
- Cấp 3–4, điều kiện thuê/uy tín chưa hoàn thiện: chỉ nêu `Đang phát triển` hoặc các mục thật đã triển khai; **không dựng nút thuê giả**.

**Trang trí**:

- Dùng danh mục vật phẩm và thao tác trang trí hiện có; nếu thiếu, trạng thái trống `Bạn chưa có đồ trang trí`.

**Lưu ý:** Mockup ghi `Mẹt hàng cơ bản` nhưng lại vẽ model có mái bạt xanh. **Ưu tiên tính đúng cấp/sức chứa/loại sạp từ project**, không ép model/số liệu cho giống hình minh họa.

### 4.4. B3 — Panel `Túi đồ`

**Bố cục đã duyệt:** grid hàng hóa bên trái; thông tin vật phẩm đang chọn bên phải; thanh sức chứa dưới.

**Tab:** `Hàng hóa` | `Trang trí` | `Vật phẩm khác` (hiển thị dữ liệu thật; tab trống có trạng thái trống dễ hiểu).

**CỰC KỲ QUAN TRỌNG — YÊU CẦU CHỈNH CỦA CHỦ DỰ ÁN:**

> Các ô chưa có vật phẩm **phải là ô trống bình thường** (cream card, border nhẹ). **Không có ổ khóa, không có chữ `Chưa mở`, không ngụ ý phải unlock ô.**

- Grid 4 cột desktop như concept; số ô tùy diện tích và quy tắc hiện có; có thể cuộn hoặc phân trang nếu nhiều vật phẩm.
- Item card có icon/tên/số lượng **trong túi**.
- Chọn item: hiển thị chi tiết, số lượng trong túi, số lượng đang bày, giá vốn bình quân **nếu dữ liệu đủ**; ghi rõ nếu dữ liệu cũ chưa có giá vốn.
- Nút `Bày vào sạp` / `Thu hồi khỏi sạp` phải tuân theo tình trạng sạp, số lượng và handler thực tế; disabled nếu không hợp lệ.
- Thanh sức chứa: chỉ hiển thị nếu game thực sự có giới hạn **túi**. Con số `30/50` trong mockup không phải quy tắc game. **Không nhầm sức chứa sạp 10/30/80 với sức chứa túi**.
- Không giả định `x12/x6/x8/x4` là hàng thật trong kho người chơi.

### 4.5. B4 — Panel `Sổ kinh doanh`

**Tab:** `Tổng quan` | `Thu chi` | `Lịch sử` | `Thống kê`.

**Tổng quan**:

- Xu hiện tại (live), doanh thu từ hoạt động bán hàng, giá vốn **hàng đã bán**, chỉ số lãi/lỗ khi xác định được. Thể hiện rõ tên chỉ số và phạm vi thời gian.
- **Không tính tiền thưởng, vốn hỗ trợ hoặc thưởng đơn đầu vào doanh thu bán hàng.**
- Tài sản: loại sạp, hàng tồn, vật phẩm trang trí dựa trên dữ liệu hiện có.
- Khu gợi ý ngắn như `Mở bán để có doanh thu` hoặc nhận xét dựa trên trạng thái thật, không tự kết luận `đang có lãi` khi dữ liệu không đủ.

**Thu chi / Lịch sử**:

- Chỉ hiển thị các giao dịch có dữ liệu thực; phân loại nhập hàng/bán hàng/thưởng/đầu tư thuê sạp rõ.
- Nếu không có lịch sử chi tiết, hiển thị trạng thái trống/thiếu dữ liệu; **không bịa transaction**.

**Thống kê**:

- Biểu đồ 7 ngày **chỉ khi thật sự có dữ liệu theo ngày**; nếu chưa có API/history, hiển thị empty-state `Chưa đủ dữ liệu để hiển thị biểu đồ`.
- **Không render các cột T2–CN giả** như ảnh concept.

**Sổ và giá vốn:** tài liệu E4 ghi FIFO / COGS đã triển khai nhưng có trường hợp hồ sơ beta thiếu giá vốn. UI cần phân biệt `Không có dữ liệu giá vốn` thay vì ghi `0 xu` và tính sai lợi nhuận.

---

## 5. TƯƠNG TÁC GIỮA CÁC PANEL / MENU

- Một `UI manager` hoặc cơ chế tương đương phải quản lý `activePanel` / dialog / focus. Có thể refactor vừa đủ, **không bắt buộc viết lại toàn kiến trúc**.
- Khi mở `Nhập hàng` thì quick action `Nhập hàng` nổi bật; sang `Túi đồ` thì highlight chuyển theo.
- Khi đổi tab trong cùng panel, không mất dữ liệu draft quan trọng nếu chưa được xác nhận; nếu đóng panel có đơn hàng nháp thì xử lý nhất quán.
- Không thêm CSS `z-index: 999999` lung tung; có thang layer rõ ràng.
- Tránh nối thêm nhiều CSS override cuối `style.css` vô kiểm soát; ưu tiên class và biến dùng chung.
- Không thay đổi/nhân đôi WebSocket listener khi mở/đóng panel; không tạo nhiều request do event handler gắn lặp.
- Không gộp các hành động trái ngữ nghĩa chỉ để đẹp hơn. Nút đang hiển thị có chức năng nhưng chưa được thiết kế mockup (giao dịch, nhiệm vụ, sự kiện) **tiếp tục mở màn hình cũ** trong vòng này.

---

## 6. RESPONSIVE / MOBILE / KEYBOARD

| Viewport test | Tiêu chí tối thiểu |
|---|---|
| Desktop 1920×1080 | Fullscene, HUD thoáng, panel centered, không che nhóm control |
| Desktop 1366×768 | Không tràn khung hoặc đè nút X, có scroll nội dung |
| Laptop nhỏ 1280×720 | Giữ thao tác thiết yếu, số liệu vẫn đọc được |
| Mobile 390×844 | HUD rút gọn; panel bottom sheet/full-height phù hợp; nút >=44×44 CSS px |
| Mobile 360×800 | Không tràn ngang, form nhập/giỏ xem được bằng scroll |
| Mobile landscape | UI không che toàn cảnh, joystick/touch controls còn dùng được |

**Quy tắc**:

- Dùng safe-area (`env(safe-area-inset-...)`) nếu phù hợp.
- Mobile không nhồi nguyên 3 nút cột trái + 4 nút quick action kích thước desktop. Có thể dùng icon dock/thu gọn có nhãn hoặc menu mở rộng; **vẫn phải tiếp cận được 7 chức năng**.
- Khi bàn phím ảo mở, không che field nhập chat/số lượng và nút xác nhận.
- Khi modal đang mở, vô hiệu hóa click-through vào canvas, xử lý focus, không để WASD/zoom/gesture lỡ điều khiển game.
- Không chỉ dựa vào màu để biểu thị trạng thái; thêm icon hoặc text.

---

## 7. DỮ LIỆU, API VÀ LƯU TRỮ: BẤT BIẾN

- **Server-authoritative**: tiền, kho, bày hàng, mua trực tiếp, mua sỉ, mặc cả, ca, quyền sạp, uy tín, thưởng.
- Không tạo phép cộng/trừ xu hay tồn kho trong DOM như một “giao dịch thành công”. UI có thể hiển thị phép tính preview nhưng phải chờ ACK/state thật.
- Không reset hoặc migration SQLite để thử giao diện; chạy backup trước những thao tác thử kinh tế nếu có.
- Khi state không sẵn sàng → `Đang tải`; khi server lỗi → lỗi hữu ích; khi mất mạng → thông báo và chặn submit trùng.
- Không tự bật tunnel công khai; dùng localhost để kiểm tra trước.
- Giữ trang đăng nhập/khôi phục và các thông tin nhạy cảm an toàn; không render mã khôi phục ra logs/UI ngoài flow được phép.

---

## 8. CHECKLIST KIỂM TRA THỰC TẾ — CHỦ DỰ ÁN CÓ THỂ TỰ TEST

### A. Vào game và HUD

- [ ] `npm run dev` và vào `localhost:5180` vẫn tải cảnh chợ 3D, không trắng màn.
- [ ] HUD phủ fullscreen, không làm canvas bị thu nhỏ.
- [ ] Không còn logo UI Chợ Cóc Online ở góc trái, không có `Trang chủ`, `Cộng đồng`, `Hướng dẫn` đứng riêng.
- [ ] Avatar sát trái, thông tin nhân vật đọc rõ và **không có cấp/XP giả**.
- [ ] Cột trái chỉ có `Sổ kinh doanh`, `Nhiệm vụ`, `Sự kiện`.
- [ ] Nút `Sự kiện` không còn chữ `Hội chợ` trong nhãn chính.
- [ ] Không còn thanh cố định `E / Chạm vào mặt đất để di chuyển` dưới giữa.
- [ ] Bốn quick action ở phải dưới: Nhập hàng, Quản lý sạp, Túi đồ, Giao dịch.
- [ ] Xu, nhiệm vụ, trạng thái sạp thay đổi đúng theo dữ liệu game.
- [ ] Vẫn đi lại/zoom/chát/đổi khu được; giữ lối truy cập bạn bè, tài khoản, trợ giúp, góp ý, báo cáo.

### B. Mở và đóng panel

- [ ] 4 panel đã duyệt có cùng style; tab chuyển đúng; chỉ 1 panel lớn mở một lần.
- [ ] Bấm X / Esc / chuyển quick action không bị kẹt, click xuyên hoặc mất keyboard focus.
- [ ] Mở/đóng liên tục không nhân đôi event handler, không tạo nhiều yêu cầu mua.

### C. Dữ liệu live

- [ ] Giá nhập/giá tham khảo của 4 món khớp catalog/server.
- [ ] Mua hàng giảm xu và tăng kho **chỉ khi ACK thành công**.
- [ ] Túi đồ có ô trống **không có khóa, không có chữ `Chưa mở`**.
- [ ] Hàng trong túi và đang bày được phân biệt; các nút bày/thu hồi tuân thủ điều kiện.
- [ ] Không có biểu đồ / số liệu thu chi giả; thiếu dữ liệu thể hiện `Chưa có dữ liệu`.
- [ ] Người chơi cũ vẫn còn tiền/hàng/sạp sau đăng nhập lại.

### D. PC/mobile/hiệu năng

- [ ] Không tràn ở 1366×768 và 390×844; chat/joystick không chồng nút chính.
- [ ] Nút close, xác nhận nhập hàng và vùng cuộn không bị che.
- [ ] Không có lỗi Console/Network khi mở/đóng panel.
- [ ] Ghi lại FPS/render metrics trước và sau trên **cùng máy/cùng cảnh**, tránh hứa FPS sẽ tốt hơn nếu chưa đo.

---

## 9. CÁC LỆNH KIỂM TRA / BÀN GIAO CẦN LÀM

Đọc `package.json` để xác nhận scripts; theo tài liệu bàn giao hiện có:

```bash
npm run check
npm test
npm run dev
```

Kiểm tra thủ công bằng browser: Console, Network (đặc biệt module JS), tương tác nút thật và screenshot viewport sau khi vào nhân vật.

**Khi bàn giao, Codex phải báo cáo:**

1. **MỐC A/B/C**: đã làm gì; mốc nào chưa làm.
2. Danh sách file sửa (path + nội dung thay đổi), tránh khẳng định sai đã hoàn tất một panel chỉ vì đổi CSS.
3. Các nút đã nối chức năng thực, nút nào bị disabled/ẩn và lý do.
4. Mọi điểm khác concept đã được cố ý điều chỉnh để **không bịa tính năng hoặc dữ liệu**.
5. Kết quả `npm run check`, `npm test`, kiểm tra browser thực tế (hoặc nói rõ chưa thể chạy/quan sát).
6. Ảnh chụp **HUD khi vừa vào game** và từng panel nếu môi trường hỗ trợ; nếu không hỗ trợ, hướng dẫn chủ dự án chụp và kiểm tra.
7. Vấn đề còn lại cần chủ dự án test/duyệt, nhất là màn 390px, thao tác mất mạng và tương tác multiplayer.

---

## 10. ĐIỀU KIỆN HOÀN THÀNH

**MỐC A đạt** khi vào game thấy HUD đã duyệt, dùng được các nút, canvas vẫn fullscreen, không làm mất quyền truy cập tính năng cũ. Đây là **checkpoint quan trọng nhất để chủ dự án kiểm tra ảnh trong game trước**.

**MỐC B đạt** khi bốn panel Nhập hàng / Quản lý sạp / Túi đồ / Sổ kinh doanh có cùng design system, render đúng dữ liệu thật, các thao tác hiện có hoạt động, không có số liệu/hệ thống giả tạo theo concept.

**MỐC C đạt** khi UI chịu được PC/mobile, không chồng panel, không click xuyên, các test tự động đạt và các thao tác gameplay cốt lõi không bị regression. Mức nghiệm thu multiplayer 6 người **vẫn phải thử sau**, không được đánh dấu “đã nghiệm thu” chỉ nhờ test UI một mình.

### QUY TẮC CHỐT

> **Ưu tiên đúng bố cục, đúng chức năng, rõ luồng thao tác hơn việc giống ảnh đến từng pixel.** Giữ game 3D thật và dữ liệu thật; không remake asset, không đổi giá hay cơ chế; mốc đầu tiên phải cho phép **vào game, xem HUD mới, click thử và nhận phản hồi thực tế**.
