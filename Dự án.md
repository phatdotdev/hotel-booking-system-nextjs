## 1. TỔNG QUAN KIẾN TRÚC & HIỆN TRẠNG DỰ ÁN

### 1.1. Công nghệ sử dụng

- **Framework**: Next.js 16 (App Router, Turbopack, React 19).
- **Cơ sở dữ liệu**: MongoDB kết nối qua Mongoose 9.x (`lib/data/mongoose.ts`).
- **Xác thực**: NextAuth.js v4 (Hỗ trợ Google OAuth + Credentials đăng nhập với mã OTP xác thực email qua Gmail Nodemailer).
- **Bản đồ**: Leaflet & MapTiler SDK (`@maptiler/sdk`, `leaflet`, `react-leaflet`).
- **Giao diện & Tiện ích**: Tailwind CSS v4, Lucide React, React Hook Form, TanStack React Query, Axios.
- **Lưu trữ đa phương tiện**: Cloudinary SDK (đã cài đặt).

---

### 1.2. Đánh giá hiện trạng các thành phần

| Phân hệ / Tính năng                     | Hiện trạng                      | Chi tiết                                                                                                                                                                                                                                                                                                                                                                     |
| :-------------------------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cơ sở dữ liệu (Models)**              | ✅ Hoàn thành 90%               | Đã thiết kế đầy đủ Schemas: `User`, `Partner`, `Hotel`, `RoomType`, `Room`, `Room-Asset`, `Booking`, `Review`, `EmailVerification`.                                                                                                                                                                                                                                          |
| **Xác thực (Auth & Account)**           | 🟡 Hoàn thành 80%               | Đã có luồng OTP email, đăng ký, đăng nhập Credentials, Google OAuth, đổi mật khẩu và trang thông tin tài khoản cá nhân.                                                                                                                                                                                                                                                      |
| **Trang công khai (Public / Customer)** | 🔴 Mới có giao diện tĩnh (~25%) | - Trang chủ (`/`): giao diện hero và search mockup.<br>- Trang bản đồ (`/hotels`): dữ liệu fix cứng (mock).<br>- **Chưa có trang Chi tiết khách sạn (`/hotels/[id]`)**.<br>- **Chưa có luồng Đặt phòng (Booking & Checkout)**.<br>- **Chưa có lịch sử đặt phòng của khách hàng**.                                                                                            |
| **Kênh Đối tác (Partner Portal)**       | 🟡 Hoàn thành 45%               | - Đã có Onboarding đối tác (`/partner/onboarding`), Profile đối tác (`/partner/profile`).<br>- Đã có trang danh sách và tạo khách sạn (`/partner/hotels/new` tích hợp MapPicker).<br>- Đã có API phòng (`/api/partners/hotels/[hotelId]/rooms`).<br>- **Chưa có giao diện (UI) quản lý Loại phòng & Phòng**.<br>- **Chưa có giao diện quản lý đơn đặt phòng của khách sạn**. |
| **Kênh Quản trị (Admin Portal)**        | 🔴 Chưa thực hiện (~5%)         | Trang `/dashboard` hiện tại mới chỉ là trang chào mừng tĩnh, chưa có màn hình phê duyệt Khách sạn, duyệt Đối tác hay thống kê toàn sàn.                                                                                                                                                                                                                                      |

---

### 1.3. Các lỗi kỹ thuật & điểm nghẽn cần xử lý ngay

1. **Lỗi TypeScript khiến dự án không thể build (`npx tsc --noEmit` fail)**:
   - File trống `app/api/auth/send-verification/route.ts` gây lỗi build vì không có handler.
   - File `app/(public)/(auth)/set-password/page.tsx` import sai đường dẫn `@/components/common/badge`.
   - File `app/(public)/account/page.tsx` truyền thiếu prop bắt buộc `isLoading` cho component `LoadingOverlay`.
   - `types/hotel.ts` và `services/partner.service.ts` bị lệch kiểu dữ liệu (`HotelListResponse` định nghĩa `data` nhưng API trả về `hotels`, `id` vs `_id`).
2. **Lệch Route & Điều hướng**:
   - Form tìm kiếm tại Header đang submit tới `/properties` (chưa tồn tại) thay vì `/hotels`.
   - Trang `/partner/hotels` gọi API cũ `/api/hotels` thay vì API phân trang mới `/api/partners/hotels`.
   - Biến môi trường `.env.local` đang khai báo `AUTH_SECRET` trong khi NextAuth v4 yêu cầu `NEXTAUTH_SECRET`.

---

## 2. KẾ HOẠCH HOÀN THIỆN DỰ ÁN (CHIA THÀNH 2 BƯỚC)

Kế hoạch được chia thành **2 Bước (2 Giai đoạn)** tiếp nối nhau:

- **Bước 1**: Tập trung hoàn thiện **Luồng người dùng / Khách hàng (Customer Core Flow)**: Sửa lỗi nền tảng, Tìm kiếm thực tế, Trang chi tiết khách sạn, Luồng Đặt phòng, Gửi email hóa đơn và Quản lý lịch sử đặt phòng cá nhân.
- **Bước 2**: Tập trung hoàn thiện **Kênh Đối tác (Partner Portal) & Quản trị viên (Admin Portal)**: Giao diện quản lý phòng & giá, upload ảnh Cloudinary, quản lý duyệt đơn, duyệt khách sạn và thống kê doanh thu.

---

### BƯỚC 1: SỬA LỖI NỀN TẢNG & HOÀN THIỆN LUỒNG ĐẶT PHÒNG KHÁCH HÀNG (CUSTOMER JOURNEY)

_Mục tiêu_: Người dùng có thể tìm kiếm khách sạn thật từ MongoDB, lọc theo yêu cầu, xem chi tiết phòng, tiến hành đặt phòng, nhận email xác nhận mã đặt phòng và quản lý kỳ nghỉ của mình.

#### 1.1. Sửa lỗi TypeScript, cấu hình và chuẩn hóa API

- Xóa bỏ hoặc hoàn thiện file trống `app/api/auth/send-verification/route.ts`.
- Sửa lỗi import `Badge` tại `set-password/page.tsx` sang `@/components/ui/badge`.
- Sửa prop `isLoading` trong `LoadingOverlay` tại `app/(public)/account/page.tsx`.
- Đồng bộ chuẩn kiểu dữ liệu `Hotel` (`_id` vs `id`) giữa `types/hotel.ts`, `services/partner.service.ts` và các trang `/partner/hotels`.
- Cập nhật form tìm kiếm ở `Header` chuyển hướng đúng sang `/hotels?search=...`.
- Bổ sung `NEXTAUTH_SECRET` vào file môi trường `.env.local`.

#### 1.2. Hoàn thiện trang Tìm kiếm & Bản đồ khách sạn (`/hotels`)

- Cập nhật API công khai `/api/public/hotels`:
  - Hỗ trợ bộ lọc động: Tìm theo tên/thành phố (`search`), khoảng giá (`minPrice`, `maxPrice`), hạng sao (`starRating`), loại chỗ nghỉ (`propertyType`), tiện ích (`amenities`).
  - Hỗ trợ lọc chỉ những khách sạn có trạng thái `status: "ACTIVE"`.
- Nâng cấp giao diện `/hotels`:
  - Thay thế danh sách giả lập `mockHotels` bằng dữ liệu thực lấy từ API `/api/public/hotels`.
  - Đồng bộ danh sách khách sạn dạng lưới (Grid/List) bên cạnh bản đồ tương tác Leaflet (nhấp vào marker sẽ cuộn đến card khách sạn tương ứng và ngược lại).
  - Kết nối ô tìm kiếm ở Trang chủ (`/`) và Header trực tiếp vào trang `/hotels`.

#### 1.3. Xây dựng Trang Chi tiết Khách sạn (`/hotels/[id]`)

- Tạo API lấy chi tiết khách sạn và các loại phòng: `GET /api/public/hotels/[id]`.
- Xây dựng giao diện trang `/hotels/[id]`:
  - **Khối thông tin chính**: Tên khách sạn, địa chỉ, hạng sao, thư viện ảnh (Gallery ảnh lớn dạng lưới/lightbox), mô tả chi tiết, tiện ích dịch vụ.
  - **Khối bản đồ vị trí**: Hiển thị vị trí chính xác của khách sạn trên bản đồ MapTiler.
  - **Khối danh sách Loại phòng (`RoomType`)**: Hiển thị từng loại phòng (Standard, Deluxe, Suite, Villa...) kèm ảnh, sức chứa (số người lớn, trẻ em), loại giường, giá tiền mỗi đêm và nút **"Chọn phòng / Đặt ngay"**.
  - **Khối Đánh giá (`Review`)**: Điểm đánh giá trung bình (VD: 4.8/5) và danh sách bình luận thực tế của khách đã lưu trú.

#### 1.4. Xây dựng Luồng Đặt phòng & Xác nhận (Booking & Checkout Flow)

- Xây dựng trang Thanh toán / Đặt phòng: `/hotels/[id]/book` (hoặc modal Checkout):
  - Cho phép chọn: Ngày nhận phòng (`checkInDate`), ngày trả phòng (`checkOutDate`), số lượng khách.
  - Tự động tính số đêm và tổng chi phí (Giá phòng x Số đêm + Thuế phí).
  - Form nhập thông tin khách lưu trú (Họ tên, Email, Số điện thoại, Ghi chú đặc biệt) — tự động điền sẵn nếu đã đăng nhập.
  - Lựa chọn phương thức thanh toán: _Thanh toán tại khách sạn (Pay at hotel)_ hoặc _Chuyển khoản / Cổng thanh toán (VNPAY / QR Code MoMo)_.
- Xây dựng API tạo đơn đặt phòng: `POST /api/bookings`:
  - Kiểm tra tình trạng phòng trống trong khoảng thời gian khách chọn để tránh trùng lịch (Overbooking).
  - Tự động sinh mã đặt phòng duy nhất dạng `BK-XXXXXX`.
  - Lưu bản ghi vào model `Booking` với trạng thái `PENDING` hoặc `CONFIRMED`.
  - Tự động gửi email xác nhận đặt phòng (gồm chi tiết phòng, ngày lưu trú, tổng tiền, mã đặt phòng) tới email khách hàng qua Nodemailer (`lib/email/mailer.ts`).
- Xây dựng trang kết quả đặt phòng thành công: `/booking/success?code=BK-XXXXXX`.

#### 1.5. Xây dựng Quản lý Đặt phòng cá nhân & Đánh giá (`/account/bookings`)

- Tạo trang danh sách kỳ nghỉ của người dùng:
  - Tab "Sắp tới", "Đã hoàn thành", "Đã hủy".
  - Hiển thị chi tiết từng đơn đặt phòng: mã booking, tên khách sạn, phòng, giá tiền, trạng thái (`CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`).
  - Hỗ trợ nút **Hủy đặt phòng** (nếu trước ngày check-in theo quy định).
- Cho phép khách hàng gửi **Đánh giá & Chấm sao** (`Review`) sau khi kỳ nghỉ kết thúc (`CHECKED_OUT`).

---

### BƯỚC 2: HOÀN THIỆN KÊNH ĐỐI TÁC (PARTNER), QUẢN TRỊ VIÊN (ADMIN) & TỐI ƯU HỆ THỐNG

_Mục tiêu_: Chủ khách sạn có thể tự cấu hình chi tiết phòng, giá phòng, theo dõi và xử lý đơn đặt phòng; Quản trị viên (Admin) kiểm soát toàn bộ đối tác, duyệt khách sạn lên sàn; hệ thống vận hành hoàn thiện, ổn định và sẵn sàng triển khai.

#### 2.1. Hoàn thiện Kênh Quản lý Phòng cho Đối tác (Partner Room Management)

- Tạo trang Quản lý Loại phòng (`/partner/hotels/[id]/room-types`):
  - Giao diện thêm / sửa / xóa Loại phòng (`RoomType`): Tên loại phòng, mô tả, sức chứa (người lớn/trẻ em), diện tích m², đơn giá mỗi đêm (`basePrice`), các tiện ích phòng.
- Tạo trang Quản lý Phòng vật lý (`/partner/hotels/[id]/rooms`):
  - Kết nối với API `/api/partners/hotels/[hotelId]/rooms` đã có: Thêm danh sách số phòng (VD: Phòng 101, 102, 201...), liên kết với Loại phòng.
  - Cập nhật trạng thái phòng: Sẵn sàng (`AVAILABLE`), Có khách (`OCCUPIED`), Bảo trì (`MAINTENANCE`).
- Tích hợp Upload ảnh trực tiếp lên **Cloudinary**:
  - Tạo Server Action / API upload ảnh an toàn (`/api/upload/image`).
  - Cho phép đối tác tải ảnh đại diện, ảnh phòng, thư viện ảnh khách sạn trực tiếp từ máy tính lên Cloudinary và lưu URL vào database.

#### 2.2. Kênh Quản lý Đơn đặt phòng cho Đối tác (Partner Booking Management)

- Tạo trang danh sách đơn đặt phòng của khách sạn: `/partner/hotels/[id]/bookings`:
  - Hiển thị danh sách khách đặt: Tên khách, số điện thoại, ngày nhận/trả, loại phòng, số tiền, trạng thái thanh toán.
  - Thao tác nhanh cho lễ tân / chủ khách sạn:
    - **Xác nhận đặt phòng** (`CONFIRMED`).
    - **Nhận phòng** (`CHECKED_IN`) và gán phòng cụ thể (VD: gán vào phòng 102).
    - **Trả phòng** (`CHECKED_OUT`) và cập nhật trạng thái thanh toán.
    - **Hủy phòng** (`CANCELLED`).
  - Phản hồi bình luận/đánh giá của khách hàng (`ownerReply` trong `Review`).

#### 2.3. Bảng điều khiển & Báo cáo Doanh thu Đối tác (Partner Analytics)

- Cập nhật trang tổng quan `/partner`:
  - Thống kê doanh thu theo tuần / tháng / năm.
  - Số lượng đơn đặt phòng mới, tỷ lệ lấp đầy phòng (Occupancy rate).
  - Danh sách khách sắp đến nhận phòng trong ngày.

#### 2.4. Xây dựng Kênh Quản trị Nền tảng (Admin Portal)

- Thiết lập phân quyền (Role-based Authorization Middleware) bảo vệ khu vực Admin: Chỉ user có `role === "ADMIN"` mới được truy cập.
- Xây dựng các màn hình quản trị tại `/admin` hoặc cập nhật `/dashboard`:
  - **Phê duyệt Đối tác (`/admin/partners`)**: Xem danh sách các hồ sơ đối tác đang `PENDING` -> Xem giấy phép, người đại diện -> Bấm Duyệt (`ACTIVE`) hoặc Từ chối (`REJECTED`).
  - **Phê duyệt Khách sạn (`/admin/hotels`)**: Xem thông tin khách sạn mới đăng ký -> Duyệt để khách sạn xuất hiện công khai trên bản đồ tìm kiếm.
  - **Quản lý Tài khoản (`/admin/users`)**: Xem danh sách toàn bộ khách hàng và đối tác, tìm kiếm, khóa/mở khóa tài khoản vi phạm.
  - **Báo cáo toàn hệ thống**: Tổng số phòng, tổng lượng booking, tổng giá trị giao dịch phát sinh trên nền tảng.

#### 2.5. Kiểm thử toàn diện (End-to-End Testing) & Đóng gói sản phẩm

- Kiểm thử luồng khép kín (End-to-End workflow):
  1. _Khách hàng_: Tìm khách sạn Cần Thơ trên bản đồ -> Chọn phòng Deluxe -> Đặt phòng thanh toán -> Nhận email hóa đơn kèm mã booking.
  2. _Đối tác_: Thấy đơn đặt phòng mới trên Partner Portal -> Bấm Check-in khi khách tới -> Bấm Check-out khi khách về.
  3. _Khách hàng_: Đăng nhập vào xem lịch sử booking -> Viết review chấm 5 sao kèm nhận xét.
  4. _Đối tác_: Xem review của khách và viết phản hồi cảm ơn.
  5. _Admin_: Theo dõi toàn bộ dòng giao dịch và quản lý hệ thống.
- Kiểm tra tính tương thích trên giao diện Điện thoại (Mobile Responsive).
- Chạy kiểm tra linting và build dự án hoàn chỉnh (`npm run build`).

---

## 3. BƯỚC TIẾP THEO

Tôi đã sẵn sàng bắt tay vào thực hiện ngay. Tôi đề xuất chúng ta bắt đầu ngay với **BƯỚC 1**:

1. Xử lý triệt để các lỗi TypeScript và lệch type trong codebase để hệ thống biên dịch sạch sẽ (`tsc --noEmit` thành công).
2. Xây dựng API và nối dữ liệu MongoDB thật cho trang tìm kiếm & bản đồ `/hotels`.
3. Xây dựng trang chi tiết khách sạn `/hotels/[id]`, hiển thị danh sách phòng và luồng đặt phòng (`/checkout`).

Bạn có đồng ý bắt đầu triển khai ngay theo lộ trình **Bước 1** này không?
