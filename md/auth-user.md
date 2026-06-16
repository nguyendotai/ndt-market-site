# Module Xác Thực Và Người Dùng

Module Auth và User cung cấp nền tảng xác thực cho khách hàng, nhân viên và quản trị viên trong backend siêu thị online.

## Model Người Dùng

`src/modules/users/users.model.ts` định nghĩa schema người dùng với các trường:

- `fullName`
- `phone`
- `email`
- `password`
- `avatar`
- `role`: `CUSTOMER`, `ADMIN`, `STAFF`, `SHIPPER`, `SUPER_ADMIN`
- `permissions`
- `status`: `ACTIVE`, `BLOCKED`
- `membershipTier`
- `totalPoints`
- timestamps

Mật khẩu được hash bằng `bcryptjs` trước khi lưu và không được trả về trong JSON/object response.

## API Xác Thực

Tất cả route xác thực được mount dưới `/api/v1/auth`.

- `POST /register`: Tạo tài khoản khách hàng và trả về access token.
- `POST /login`: Kiểm tra thông tin đăng nhập và trả về access token.
- `GET /me`: Trả về thông tin người dùng đang đăng nhập.
- `POST /logout`: Trả về xác nhận đăng xuất cho client dùng token.
- `PATCH /change-password`: Đổi mật khẩu của người dùng đang đăng nhập.

## Body Đăng Ký

Field bắt buộc:

- `email`
- `password`
- `confirmPassword`

Field tùy chọn:

- `fullName`
- `phone`
- `avatar`

Ví dụ:

```json
{
  "email": "customer@example.com",
  "password": "Customer@123",
  "confirmPassword": "Customer@123",
  "fullName": "Nguyen Van A",
  "phone": "0900000001",
  "avatar": "https://res.cloudinary.com/demo/avatar.jpg"
}
```

Lưu ý:

- `confirmPassword` phải trùng với `password`.
- Key chuẩn nên dùng là `confirmPassword`.
- Khi test bằng Postman, backend cũng hỗ trợ alias `confirmpassword` và `confirm_password`.
- `confirmPassword` không được lưu vào database.
- Nếu không gửi `fullName`, backend tự dùng phần trước ký tự `@` của email làm tên mặc định.
- `phone` và `avatar` có thể bỏ trống. Nếu form gửi chuỗi rỗng `""`, backend sẽ hiểu là không truyền.
- Trong Postman nên chọn `Body -> raw -> JSON` và header `Content-Type: application/json`.

## Middleware Xác Thực

`authMiddleware` kiểm tra JWT access token, tải người dùng đang hoạt động và gắn vào `req.user`.

`authorizeRoles(...roles)` giới hạn route theo các role được phép truy cập.

`authorizePermissions(...permissions)` giới hạn route admin theo permission key, trừ `SUPER_ADMIN` luôn có toàn quyền.

## API Quản Lý Khách Hàng Và Nhân Viên

Các API quản trị user nằm dưới `/api/v1/admin/users`.

Yêu cầu:

- Auth required: Có.
- Role required: `ADMIN`, `STAFF`, hoặc `SUPER_ADMIN`.
- Permission required: `customers.manage`, trừ `SUPER_ADMIN` luôn có toàn quyền.

Endpoints:

- `GET /admin/users`: Lấy danh sách khách hàng và nhân viên.
- `GET /admin/users/:id`: Lấy chi tiết user.
- `PATCH /admin/users/:id/status`: Cập nhật trạng thái user.
- `PATCH /admin/users/:id/role`: Cập nhật role và permissions tùy chọn.

Query của `GET /admin/users`:

- `keyword`: Search theo `fullName`, `email`, `phone`.
- `search`: Alias của `keyword`.
- `role`: `CUSTOMER`, `ADMIN`, `STAFF`, `SHIPPER`, `SUPER_ADMIN`.
- `status`: `ACTIVE`, `BLOCKED`.
- `page`: Trang hiện tại.
- `limit`: Số item mỗi trang.

Body cập nhật status:

```json
{
  "status": "BLOCKED"
}
```

Body cập nhật role:

```json
{
  "role": "STAFF",
  "permissions": ["catalog.manage", "orders.manage"]
}
```

Lưu ý:

- Khi đổi role về `CUSTOMER`, backend tự clear `permissions`.
- Response user không trả về `password`.
