# Module Giỏ Hàng

Module Cart quản lý giỏ hàng active của khách hàng theo cửa hàng đã chọn.

## Cart Model

Model cart gồm:

- `user`: Người sở hữu giỏ hàng.
- `store`: Cửa hàng được chọn để kiểm tra tồn kho.
- timestamps.

Mỗi user có một cart active. Nếu user chưa có cart, hệ thống tự tạo cart khi gọi API giỏ hàng.

## CartItem Model

Model cart item gồm:

- `cart`: Giỏ hàng.
- `variant`: Biến thể sản phẩm.
- `quantity`: Số lượng hiển thị theo đơn vị bán.
- `quantityBase`: Số lượng theo đơn vị tồn kho cơ sở.
- `displayQuantity`: Số lượng hiển thị cho frontend.
- `displayUnit`: Đơn vị hiển thị, lấy từ `variant.sellUnit`.
- `inventoryUnit`: Đơn vị tồn kho cơ sở, lấy từ `variant.inventoryUnit`.
- `priceSnapshot`: Giá tại thời điểm thêm/cập nhật sản phẩm vào giỏ.
- `priceUnit`: Đơn vị tính giá, lấy từ `variant.sellUnit`.
- `saleType`: Loại sản phẩm bán, lấy từ `variant.saleType`.
- timestamps.

## API

Tất cả route cart được mount tại `/api/v1/cart` và yêu cầu đăng nhập.

- `GET /cart`: Lấy giỏ hàng hiện tại.
- `PATCH /cart/store`: Cập nhật cửa hàng của giỏ.
- `POST /cart/items`: Thêm sản phẩm vào giỏ hàng.
- `PATCH /cart/items/:itemId`: Cập nhật số lượng item trong giỏ.
- `DELETE /cart/items/:itemId`: Xóa item khỏi giỏ.
- `DELETE /cart/clear`: Xóa toàn bộ item trong giỏ.

## Luồng Thêm Sản Phẩm Vào Giỏ

Bước 1: User phải đăng nhập.

Bước 2: User chọn cửa hàng trước khi thêm sản phẩm.

Endpoint:

- `PATCH /api/v1/cart/store`

```json
{
  "store": "665f00000000000000000010"
}
```

Quy tắc:

- Store phải tồn tại và có `status: "ACTIVE"`.
- Nếu user đổi sang store khác, backend tự xóa toàn bộ item hiện tại để tránh kiểm tồn kho sai cửa hàng.

Bước 3: Frontend chọn `variant` cần mua.

Backend kiểm tra:

- Variant phải tồn tại.
- Variant phải có `status: "ACTIVE"`.
- Product của variant phải có `status: "ACTIVE"`.

Bước 4: Frontend gửi số lượng.

Endpoint:

- `POST /api/v1/cart/items`

Body nhận một trong hai kiểu:

- `quantity`: Số lượng theo đơn vị bán.
- `quantityBase`: Số lượng theo đơn vị tồn kho cơ sở.

Backend yêu cầu phải có ít nhất một trong hai field này.

## Ví Dụ Thêm Hàng Bán Theo Đơn Vị

Ví dụ Coca bán theo lon:

- `sellUnit`: `CAN`
- `inventoryUnit`: `PIECE`
- `conversionRateToInventoryUnit`: `1`
- `allowDecimalQuantity`: `false`

Request:

```json
{
  "variant": "665f00000000000000000020",
  "quantity": 2
}
```

Backend quy đổi:

```text
quantityBase = quantity * conversionRateToInventoryUnit
quantityBase = 2 * 1 = 2 PIECE
```

Cart item lưu:

```json
{
  "quantity": 2,
  "quantityBase": 2,
  "displayQuantity": 2,
  "displayUnit": "CAN",
  "inventoryUnit": "PIECE",
  "priceUnit": "CAN"
}
```

## Ví Dụ Thêm Hàng Đóng Gói Theo Trọng Lượng

Ví dụ cải thìa baby gói 300g:

- `saleType`: `PACKAGED_WEIGHT_PRODUCT`
- `sellUnit`: `PACK`
- `inventoryUnit`: `PIECE`
- `conversionRateToInventoryUnit`: `1`
- `packageWeight`: `300`
- `packageWeightUnit`: `GRAM`
- `price`: `37900`

Request mua 1 gói:

```json
{
  "variant": "665f00000000000000000020",
  "quantity": 1
}
```

Backend quy đổi:

```text
quantityBase = 1 * 1 = 1 PIECE
```

Cart item lưu:

```json
{
  "quantity": 1,
  "quantityBase": 1,
  "displayQuantity": 1,
  "displayUnit": "PACK",
  "inventoryUnit": "PIECE",
  "priceSnapshot": 37900,
  "priceUnit": "PACK",
  "saleType": "PACKAGED_WEIGHT_PRODUCT"
}
```

Frontend có thể hiển thị:

```text
37.900đ / gói 300g
```

## Ví Dụ Thêm Hàng Cân Ký

Ví dụ táo bán theo kg nhưng tồn kho bằng gram:

- `saleType`: `WEIGHT_BASED_PRODUCT`
- `sellUnit`: `KILOGRAM`
- `inventoryUnit`: `GRAM`
- `conversionRateToInventoryUnit`: `1000`
- `allowDecimalQuantity`: `true`
- `minOrderQuantity`: `100`
- `stepQuantity`: `50`
- `price`: `89000`

Cách 1: Gửi theo đơn vị bán, mua `0.75kg`:

```json
{
  "variant": "665f00000000000000000020",
  "quantity": 0.75
}
```

Backend quy đổi:

```text
quantityBase = round(0.75 * 1000) = 750 GRAM
displayQuantity = 750 / 1000 = 0.75 KILOGRAM
```

Cách 2: Gửi trực tiếp theo đơn vị tồn kho, mua `750g`:

```json
{
  "variant": "665f00000000000000000020",
  "quantityBase": 750
}
```

Cart item lưu:

```json
{
  "quantity": 0.75,
  "quantityBase": 750,
  "displayQuantity": 0.75,
  "displayUnit": "KILOGRAM",
  "inventoryUnit": "GRAM",
  "priceSnapshot": 89000,
  "priceUnit": "KILOGRAM",
  "saleType": "WEIGHT_BASED_PRODUCT"
}
```

Subtotal item:

```text
itemTotal = priceSnapshot * displayQuantity
itemTotal = 89000 * 0.75 = 66750
```

## Quy Tắc Số Lượng

Backend dùng cấu hình variant để kiểm tra số lượng:

- Nếu `allowDecimalQuantity = false`, `displayQuantity` phải là số nguyên.
- `quantityBase` phải lớn hơn hoặc bằng `minOrderQuantity`.
- Nếu có `maxOrderQuantity`, `quantityBase` không được vượt quá `maxOrderQuantity`.
- Nếu `stepQuantity > 0`, `quantityBase` phải chia hết cho `stepQuantity`.

Ví dụ hàng cân ký có:

```text
minOrderQuantity = 100
stepQuantity = 50
```

Các số lượng hợp lệ:

- `100g`
- `150g`
- `200g`
- `750g`

Các số lượng không hợp lệ:

- `80g`: Nhỏ hơn min.
- `125g`: Không đúng step `50g`.

## Quy Tắc Tồn Kho

Trước khi thêm hoặc cập nhật item, backend kiểm tra tồn kho tại store đã chọn:

```text
availableQuantityBase = inventory.quantityBase - inventory.reservedQuantityBase
```

Nếu `quantityBase` muốn mua lớn hơn `availableQuantityBase`, backend trả lỗi:

```text
Cart quantity exceeds available stock
```

Nếu cùng một variant đã có trong giỏ, khi gọi `POST /cart/items`, backend cộng dồn số lượng:

```text
nextQuantityBase = currentItem.quantityBase + newQuantityBase
```

Sau đó backend kiểm tra `nextQuantityBase` với tồn kho khả dụng.

## Giá Snapshot

Khi thêm item, backend lưu `priceSnapshot` tại thời điểm thêm/cập nhật.

Quy tắc lấy giá:

- Nếu `variant.salePrice > 0`, dùng `salePrice`.
- Nếu `salePrice` bằng `0`, rỗng hoặc không có, dùng `price`.

Điều này tránh lỗi frontend hiển thị `0đ` khi form gửi `salePrice: 0`.

## Response Giỏ Hàng

Response giỏ hàng populate:

- `store`
- `variant`
- `product`
- `category`
- `brand`
- `images`

Response có thêm:

- `subtotal`: Tổng tiền tạm tính.
- `totalItems`: Tổng `quantityBase` của các item.

Ví dụ response rút gọn:

```json
{
  "success": true,
  "data": {
    "_id": "665f00000000000000000001",
    "store": {
      "_id": "665f00000000000000000010",
      "name": "NDT Market Quận 1"
    },
    "items": [
      {
        "_id": "665f00000000000000000030",
        "quantity": 1,
        "quantityBase": 1,
        "displayQuantity": 1,
        "displayUnit": "PACK",
        "inventoryUnit": "PIECE",
        "priceSnapshot": 37900,
        "priceUnit": "PACK",
        "saleType": "PACKAGED_WEIGHT_PRODUCT",
        "product": {
          "_id": "665f00000000000000000040",
          "name": "Cải thìa baby DalatGap gói 300g"
        },
        "variant": {
          "_id": "665f00000000000000000020",
          "name": "Cải thìa baby DalatGap gói 300g"
        },
        "images": []
      }
    ],
    "subtotal": 37900,
    "totalItems": 1
  }
}
```

## Cập Nhật Số Lượng Item

Endpoint:

- `PATCH /api/v1/cart/items/:itemId`

Body giống API thêm item:

```json
{
  "quantity": 2
}
```

Hoặc:

```json
{
  "quantityBase": 750
}
```

Khác với `POST /cart/items`, API cập nhật sẽ thay thế số lượng item hiện tại bằng số lượng mới.

## Xóa Giỏ Hàng

Xóa một item:

- `DELETE /api/v1/cart/items/:itemId`

Xóa toàn bộ item:

- `DELETE /api/v1/cart/clear`

## Quy Tắc Nghiệp Vụ

- Một user chỉ có một cart active.
- Trước khi thêm sản phẩm, user phải chọn store bằng `PATCH /cart/store`.
- Khi đổi store, hệ thống xóa các item hiện tại để tránh kiểm tra tồn kho sai cửa hàng.
- Khi thêm hoặc cập nhật item, hệ thống kiểm tra variant và product phải active.
- Không cho phép `quantityBase` trong cart vượt quá tồn kho khả dụng của variant tại store đã chọn.
- Hàng bán theo đơn vị nên gửi `quantity`.
- Hàng đóng gói theo trọng lượng nên gửi `quantity`.
- Hàng cân ký nên gửi `quantityBase` để tránh sai số và dễ khớp min/step.

