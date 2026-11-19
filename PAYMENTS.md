# Thanh toán VNPAY và MoMo

Điền các biến trong `.env.local` theo [.env.example](.env.example). Secret chỉ nằm trên server. `PAYMENT_BASE_URL` phải là URL HTTPS công khai của ứng dụng, không có dấu `/` cuối. Hai cổng tự ẩn ở trang đặt phòng cho đến khi có đủ cấu hình.

## VNPAY

Điền `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`. `VNPAY_PAYMENT_URL` mặc định dùng sandbox `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`; đổi sang URL production do VNPAY cung cấp khi chuyển môi trường.

Khai báo trong merchant dashboard:

- Return URL: `${PAYMENT_BASE_URL}/api/payments/vnpay/return`
- IPN URL: `${PAYMENT_BASE_URL}/api/payments/vnpay/ipn`

IPN xác minh HMAC-SHA512, merchant code, mã đơn và số tiền trước khi xác nhận. Return URL chỉ đưa khách về trang trạng thái; IPN mới cập nhật đơn. [Tài liệu VNPAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).

## MoMo

Điền `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`. `MOMO_ENDPOINT` mặc định là sandbox `https://test-payment.momo.vn/v2/gateway/api/create`; đổi sang endpoint production do MoMo cung cấp khi chuyển môi trường.

Ứng dụng gửi các URL sau trong request tạo thanh toán:

- Redirect URL: `${PAYMENT_BASE_URL}/api/payments/momo/return`
- IPN URL: `${PAYMENT_BASE_URL}/api/payments/momo/ipn`

IPN xác minh HMAC-SHA256, partner code, request ID, mã đơn và số tiền. Route phản hồi HTTP 204 sau khi cập nhật đơn. [Tài liệu MoMo](https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/), [IPN](https://developers.momo.vn/v3/docs/payment/api/result-handling/notification/).

Đơn thanh toán trực tuyến ở trạng thái `PENDING` cho đến khi IPN xác nhận. Nếu gửi email thất bại, trạng thái thanh toán vẫn được lưu và lỗi được ghi log. Với yêu cầu hoàn tiền hoặc đơn chưa nhận được IPN, cần đối soát trong merchant dashboard trước khi thay đổi đơn thủ công. Thử thanh toán trên sandbox bằng tài khoản thử nghiệm của từng cổng trước khi dùng production.
