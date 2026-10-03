# SECO Mobile FE

Prototype mobile frontend cho các task được gán `HieuLN` trong `SECO - MasterSheet.xlsx`.

## Cấu trúc dự án

```text
public/
  index.html
  assets/template/       # ảnh thiết kế tham chiếu
  vendor/                # Leaflet và Lucide được vendored local
src/
  app.js                 # state, routing và màn hình mobile
  config.js              # API base URL, auth và endpoint map
  styles.css             # design system và responsive layout
server/
  server.js              # static development server
docs/
  SECO - Design Document.docx
  SECO - MasterSheet.xlsx
package.json
README.md
```

## Chạy local

```bash
npm run dev
```

Mở `http://localhost:4173` trên trình duyệt. App không cần cài dependency npm; `server/server.js` phục vụ entry point trong `public/`, mã nguồn trong `src/` và asset trong `public/assets/`.

## Phạm vi đã dựng

- `FE-U01` → `FE-U09`: đăng nhập, bản đồ/danh sách trạm, chi tiết trạm, thiết lập ngân sách, phiên sạc realtime từ backend, kết quả phiên, ví, lịch sử giao dịch/phiên và tài khoản.
- `MB-01` → `MB-05`: không gian Technician, thông báo sự cố, chi tiết fault/telemetry, checklist bảo trì và báo cáo sửa chữa.
- Trang bổ sung: quên mật khẩu, bộ lọc trạm, chia sẻ trạm, QR ví, thẻ RFID, cài đặt thông báo/ngôn ngữ, đổi mật khẩu, quản lý xe, trợ giúp và bài viết FAQ.
- Luồng demo: đăng nhập → chọn trạm → chọn ngân sách → quẹt RFID → cắm sạc → dừng phiên → xem kết quả/lịch sử; hoặc chuyển sang Technician để xử lý `SECO-04` từ fault đến report.

Các ảnh trong `public/assets/template/` được giữ nguyên và dùng làm nguồn tham chiếu trực tiếp cho design system.

Màn hình `Trạm` dùng Leaflet với tile OpenStreetMap thật. App đọc `GET /api/v1/stations`; response backend dùng `station_id`, `latitude`, `longitude`, `status`, `availability` và được chuẩn hóa trước khi hiển thị. Marker click sẽ mở chi tiết station tương ứng và bản đồ tự zoom theo nhóm trạm thật. Tab `Sạc` và `Lịch sử` được hợp thành một tab: khi có phiên đang chạy sẽ hiển thị realtime, còn lại hiển thị lịch sử sạc.

Khi trình duyệt cấp quyền GPS, vị trí người dùng được hiển thị bằng marker riêng trên bản đồ. Mô tả ngắn của trạm có nút `Chỉ đường`, mở Google Maps với tọa độ hiện tại và tọa độ trạm; nếu chưa có GPS, Google Maps vẫn mở theo điểm đến.

## Cấu hình API

`src/config.js` đang dùng `/api/v1` cùng proxy của `server/server.js`, vì vậy chạy local không bị lỗi CORS với backend Render. Proxy chuyển tiếp request tới `https://seco-backend-api.onrender.com`; nếu frontend được deploy sau cùng domain với backend, có thể đổi `apiBaseUrl` sang `remoteApiBaseUrl`. Các request dùng `apiRequest()` và tự thêm Bearer token sau khi login.

Luồng member thật dùng `POST /member/rfid/verify`, `POST /member/charging/start`, `POST /member/charging/{session_id}/stop`, `GET /member/charging/current`, `GET /member/wallet`, `POST /member/topup`, `GET /member/transactions` và `GET /member/sessions`. Backend hiện chưa công bố WebSocket trong OpenAPI, nên phiên đang chạy được đồng bộ bằng polling `GET /member/charging/current` mỗi 5 giây. Màn hình RFID nhận UID từ phần cứng/đầu đọc rồi mới gọi API, không giả định UID demo.

Thông báo phiên sạc, thông báo trạm yêu thích và thông báo sự cố Technician dùng Web Notification của trình duyệt; môi trường production cần cấp quyền notification và có thể thay lớp này bằng FCM/APNs. OpenAPI hiện chưa có nhóm endpoint Technician riêng, nên các màn hình bảo trì vẫn giữ workflow mobile và chưa gửi mutation lên backend cho đến khi BE công bố contract tương ứng.
