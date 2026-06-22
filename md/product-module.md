# Module Sản Phẩm

Module Product quản lý sản phẩm, combo sản phẩm, biến thể, hình ảnh, tìm kiếm, lọc và dữ liệu hiển thị cho website siêu thị online.

## Nguyên Tắc Thiết Kế

Tất cả sản phẩm bán được đều đi qua `ProductVariant`.

- Sản phẩm thường dùng `productType: "SIMPLE"`.
- Sản phẩm combo dùng `productType: "COMBO"`.
- Combo vẫn là một `Product` riêng để có slug, SEO, hình ảnh, mô tả, variant giá bán và trang chi tiết riêng.
- Các sản phẩm nằm trong combo được lưu ở `ProductComboItem`.
- Public API chỉ trả sản phẩm `ACTIVE`.
- Admin API trả sản phẩm ở tất cả trạng thái để quản trị viên có thể xem cả `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`.

## Product Model

Model sản phẩm gồm:

- `category`: ObjectId danh mục sản phẩm, bắt buộc.
- `brand`: ObjectId thương hiệu sản phẩm, không bắt buộc và có thể là `null`.
- `name`: Tên sản phẩm, bắt buộc.
- `slug`: Slug tự động tạo từ `name`, không nhập từ form tạo.
- `sku`: Mã SKU unique và dùng để tìm kiếm. Backend tự sinh khi tạo sản phẩm nếu không gửi.
- `productType`: `SIMPLE` hoặc `COMBO`. Mặc định là `SIMPLE`.
- `description`: Mô tả đầy đủ dạng HTML string. Backend lưu nguyên HTML để frontend có thể định dạng nội dung và chèn ảnh.
- `unit`: Đơn vị bán chính của sản phẩm.
- `origin`: Xuất xứ.
- `ingredients`: Danh sách thành phần.
- `storageInstruction`: Hướng dẫn bảo quản.
- `status`: `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`.
- `tags`: Danh sách tag phục vụ tìm kiếm và lọc.
- `soldCount`: Số lượng đã bán.
- `ratingAverage`: Điểm đánh giá trung bình.
- `ratingCount`: Số lượt đánh giá.
- timestamps.

## ProductVariant Model

Model biến thể gồm:

- `product`: ObjectId sản phẩm.
- `name`: Tên biến thể, ví dụ `500g`, `1kg`, `Hộp 12 chai`.
- `barcode`: Mã barcode unique. Backend tự sinh khi tạo biến thể nếu không gửi.
- `imageUrl`: Ảnh riêng của biến thể, nên lấy từ API upload Cloudinary.
- `saleType`: `UNIT_PRODUCT`, `PACKAGED_WEIGHT_PRODUCT`, `WEIGHT_BASED_PRODUCT`.
- `inventoryType`: `UNIT`, `WEIGHT`.
- `sellUnit`: Đơn vị bán như `PIECE`, `PACK`, `CAN`, `KILOGRAM`.
- `inventoryUnit`: Đơn vị tồn kho cơ sở như `PIECE`, `GRAM`.
- `conversionRateToInventoryUnit`: Tỷ lệ quy đổi từ đơn vị bán sang đơn vị tồn kho.
- `packageWeight`: Trọng lượng đóng gói nếu là sản phẩm đóng gói theo trọng lượng.
- `packageWeightUnit`: Đơn vị trọng lượng đóng gói như `GRAM`, `KILOGRAM`.
- `price`: Giá gốc.
- `salePrice`: Giá khuyến mãi, phải nhỏ hơn hoặc bằng `price`. Nếu gửi `0`, chuỗi rỗng hoặc không gửi thì backend hiểu là không có giá khuyến mãi và dùng `price`.
- `weight`: Khối lượng.
- `unit`: Đơn vị hiển thị của biến thể.
- `allowDecimalQuantity`: Cho phép mua số lượng thập phân hay không.
- `minOrderQuantity`: Số lượng tối thiểu theo `inventoryUnit`.
- `maxOrderQuantity`: Số lượng tối đa theo `inventoryUnit`.
- `stepQuantity`: Bước nhảy số lượng theo `inventoryUnit`.
- `barcodeType`: `FIXED`, `SCALE_WEIGHT`, `SCALE_PRICE`.
- `pluCode`: Mã PLU cho cân điện tử/POS.
- `status`: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`.
- timestamps.

## ProductImage Model

Model hình ảnh gồm:

- `product`: ObjectId sản phẩm.
- `imageUrl`: URL ảnh gallery/thumbnail cấp sản phẩm, nên lấy từ API upload Cloudinary.
- `isThumbnail`: Có phải ảnh đại diện hay không.
- `sortOrder`: Thứ tự hiển thị.
- timestamps.

## ProductComboItem Model

Combo được thiết kế như một sản phẩm riêng có `productType: "COMBO"`.
Danh sách sản phẩm nằm trong combo được lưu ở `ProductComboItem`, không nhúng trực tiếp vào document `Product` để dễ populate, sắp xếp và mở rộng tồn kho sau này.

Model combo item gồm:

- `comboProduct`: ObjectId sản phẩm combo.
- `product`: ObjectId sản phẩm thành phần.
- `variant`: ObjectId biến thể thành phần, optional.
- `quantity`: Số lượng hiển thị/bán theo đơn vị bán.
- `quantityBase`: Số lượng quy đổi theo đơn vị tồn kho cơ sở, optional.
- `unitLabel`: Nhãn đơn vị hiển thị như `lon`, `gói`, `kg`.
- `sortOrder`: Thứ tự hiển thị trong chi tiết combo.
- timestamps.

Khi gọi `GET /api/v1/products/:slug`, response sản phẩm combo có thêm `comboItems`, trong đó populate `product` và `variant` để frontend hiển thị đầy đủ các sản phẩm trong combo.

## Khác Nhau Giữa Ảnh Product Và Ảnh Variant

- `ProductImage`: Dùng cho gallery và thumbnail chung của sản phẩm.
- `ProductVariant.imageUrl`: Dùng cho ảnh riêng của từng biến thể, ví dụ cùng một sản phẩm nhưng biến thể khác màu, khác size, khác quy cách đóng gói.

Frontend nên ưu tiên hiển thị `variant.imageUrl` khi người dùng chọn biến thể. Nếu biến thể không có ảnh riêng, fallback về ảnh thumbnail trong `images`.

Khi cập nhật `ProductVariant.imageUrl`, backend sẽ xóa ảnh Cloudinary cũ. Khi xóa variant, product image hoặc product, backend cũng xóa các ảnh Cloudinary liên quan.

## Form Tạo Sản Phẩm

API tạo sản phẩm chỉ tạo dữ liệu Product. Biến thể và hình ảnh được tạo bằng API riêng sau khi đã có `_id` sản phẩm.

Endpoint:

- `POST /api/v1/admin/products`

Auth:

- Auth required: Có.
- Role required: `ADMIN`, `STAFF`, hoặc `SUPER_ADMIN`.
- Permission required: `catalog.manage`.

Payload:

```json
{
  "category": "665f00000000000000000001",
  "brand": "665f00000000000000000002",
  "name": "Rau muống sạch",
  "productType": "SIMPLE",
  "description": "<h2>Rau muống sạch</h2><p>Rau tươi mỗi ngày, phù hợp cho bữa ăn gia đình.</p><img src=\"https://res.cloudinary.com/demo/image/upload/rau-muong.jpg\" alt=\"Rau muống sạch\" />",
  "unit": "bó",
  "origin": "Việt Nam",
  "ingredients": ["Rau muống"],
  "storageInstruction": "Bảo quản nơi thoáng mát hoặc trong ngăn mát tủ lạnh.",
  "status": "ACTIVE",
  "tags": ["rau", "rau-sach", "tuoi-song"],
  "soldCount": 0,
  "ratingAverage": 0,
  "ratingCount": 0
}
```

Field bắt buộc:

- `category`
- `name`

Lưu ý khi gửi từ form frontend:

- `category` phải là ObjectId hợp lệ của danh mục.
- `sku` có thể bỏ trống. Nếu không gửi hoặc gửi chuỗi rỗng `""`, backend tự tạo SKU unique.
- Nếu gửi `sku` thủ công, SKU sẽ được chuẩn hóa uppercase và phải unique.
- `brand` có thể bỏ trống. Nếu form gửi `brand` là chuỗi rỗng `""`, backend sẽ lưu là `null`.
- `productType` có thể bỏ trống, backend mặc định là `SIMPLE`. Khi tạo combo, gửi `COMBO`.
- `description` lưu dưới dạng HTML string. Nếu cần chèn ảnh trong mô tả, upload ảnh lên Cloudinary trước rồi dùng URL trả về trong thẻ `<img>`.
- Backend không tự render HTML; frontend chịu trách nhiệm hiển thị HTML an toàn bằng rich text renderer phù hợp.
- `ingredients` và `tags` có thể gửi dạng array hoặc chuỗi phân tách bằng dấu phẩy.
- Các field số như `soldCount`, `ratingAverage`, `ratingCount` có thể gửi dạng number hoặc chuỗi số từ input form.
- Nếu chưa cần quản lý thủ công, frontend có thể không gửi `soldCount`, `ratingAverage`, `ratingCount`; backend sẽ dùng mặc định từ model.

Field không gửi trong form tạo:

- `slug`: Backend tự generate từ `name`.
- `sku`: Có thể không gửi, backend tự generate.
- `variants`: Tạo bằng `POST /api/v1/admin/products/:id/variants`.
- `images`: Tạo bằng `POST /api/v1/admin/products/:id/images`.
- `comboItems`: Tạo bằng `POST /api/v1/admin/products/:id/combo-items` nếu là combo.
- `_id`, `createdAt`, `updatedAt`: MongoDB tự tạo.

## Form Tạo Biến Thể Sản Phẩm

Trước khi lưu ảnh riêng cho biến thể, upload ảnh lên Cloudinary:

- `POST /api/v1/uploads/image`
- `multipart/form-data`
- `folder`: `product`
- `image`: File ảnh.

Sau đó dùng URL trả về ở field `imageUrl`.

Endpoint:

- `POST /api/v1/admin/products/:id/variants`

Payload:

```json
{
  "name": "500g",
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/product-variant.jpg",
  "saleType": "PACKAGED_WEIGHT_PRODUCT",
  "inventoryType": "UNIT",
  "sellUnit": "PACK",
  "inventoryUnit": "PIECE",
  "conversionRateToInventoryUnit": 1,
  "packageWeight": 500,
  "packageWeightUnit": "GRAM",
  "price": 25000,
  "salePrice": 22000,
  "weight": 500,
  "unit": "g",
  "allowDecimalQuantity": false,
  "minOrderQuantity": 1,
  "stepQuantity": 1,
  "barcodeType": "FIXED",
  "status": "ACTIVE"
}
```

Field bắt buộc:

- `name`
- `price`

Lưu ý:

- `imageUrl` là optional.
- `barcode` có thể bỏ trống. Nếu không gửi hoặc gửi chuỗi rỗng `""`, backend tự tạo barcode unique.
- Nếu gửi `barcode` thủ công, barcode phải unique.
- Với hàng cân ký, nên dùng `saleType: "WEIGHT_BASED_PRODUCT"`, `inventoryType: "WEIGHT"`, `sellUnit: "KILOGRAM"`, `inventoryUnit: "GRAM"`, `conversionRateToInventoryUnit: 1000`.
- `salePrice` không được lớn hơn `price`.
- Nếu không có khuyến mãi, frontend nên gửi `salePrice` là `0`, chuỗi rỗng `""` hoặc không gửi field này; backend sẽ không lưu `salePrice` để tránh hiển thị giá `0đ`.
- Với `PACKAGED_WEIGHT_PRODUCT`, backend ưu tiên đơn vị hiển thị theo `sellUnit` như `PACK`, không dùng `GRAM` làm đơn vị bán.
- `status` mặc định là `ACTIVE` nếu không truyền.
- `price`, `salePrice`, `weight` có thể gửi dạng number hoặc chuỗi số từ input form.

## Form Tạo Combo Sản Phẩm

Bước 1: Tạo product combo.

Endpoint:

- `POST /api/v1/admin/products`

```json
{
  "category": "665f00000000000000000001",
  "name": "Combo Bữa Sáng Tiện Lợi",
  "productType": "COMBO",
  "description": "<h2>Combo tiện lợi</h2><p>Combo gồm sữa hộp và mì gói.</p>",
  "unit": "combo",
  "status": "ACTIVE",
  "tags": ["combo", "tiet-kiem"]
}
```

Bước 2: Tạo variant bán cho combo để có giá, SKU/barcode.

Endpoint:

- `POST /api/v1/admin/products/:id/variants`

```json
{
  "name": "Combo 2 món",
  "price": 45000,
  "salePrice": 39000,
  "saleType": "UNIT_PRODUCT",
  "inventoryType": "UNIT",
  "sellUnit": "PACK",
  "inventoryUnit": "PIECE"
}
```

Bước 3: Thêm sản phẩm thành phần vào combo.

Endpoint:

- `POST /api/v1/admin/products/:id/combo-items`

```json
{
  "product": "665f00000000000000000020",
  "variant": "665f00000000000000000030",
  "quantity": 1,
  "quantityBase": 1,
  "unitLabel": "hộp",
  "sortOrder": 1
}
```

```json
{
  "product": "665f00000000000000000021",
  "variant": "665f00000000000000000031",
  "quantity": 1,
  "quantityBase": 1,
  "unitLabel": "gói",
  "sortOrder": 2
}
```

Lưu ý:

- Chỉ sản phẩm có `productType: "COMBO"` mới được thêm combo item.
- Combo không được chứa chính nó.
- Nếu gửi `variant`, backend kiểm tra variant phải thuộc sản phẩm thành phần.
- Trang chi tiết combo sử dụng `comboItems` để hiển thị các sản phẩm trong combo.
- Khi xóa sản phẩm combo, backend xóa các combo item liên quan.
- Khi xóa một sản phẩm thường, backend cũng xóa các dòng combo item đang tham chiếu tới sản phẩm đó.

## Form Thêm Ảnh Gallery Sản Phẩm

Trước tiên upload ảnh lên Cloudinary:

- `POST /api/v1/uploads/image`
- `multipart/form-data`
- `folder`: `product`
- `image`: File ảnh.

Sau đó dùng URL trả về để thêm ảnh gallery/thumbnail cho sản phẩm:

- `POST /api/v1/admin/products/:id/images`

Payload:

```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/product.jpg",
  "isThumbnail": true,
  "sortOrder": 1
}
```

Field bắt buộc:

- `imageUrl`

Lưu ý:

- `isThumbnail` có thể gửi dạng boolean hoặc chuỗi `"true"`/`"false"`.
- `sortOrder` có thể gửi dạng number hoặc chuỗi số.

## API Public

Các route public nằm dưới `/api/v1/products`.

- `GET /api/v1/products`: Lấy danh sách sản phẩm active, có pagination, filter và search nâng cao.
- `GET /api/v1/products/:slug`: Lấy chi tiết sản phẩm active theo slug.
- `GET /api/v1/products/:slug/related`: Lấy sản phẩm liên quan theo cùng danh mục.
- `GET /api/v1/products/:variantId/inventory`: Lấy tồn kho của biến thể.
- `GET /api/v1/products/:slug/reviews`: Lấy đánh giá đã duyệt của sản phẩm.
- `POST /api/v1/products/:productId/reviews`: Người dùng tạo đánh giá sản phẩm đã mua.

Query của `GET /products`:

- `keyword`: Search theo `name`, `sku`, `description`.
- `category`: Lọc theo category id hoặc slug.
- `brand`: Lọc theo brand id hoặc slug.
- `minPrice`: Giá thấp nhất theo variant.
- `maxPrice`: Giá cao nhất theo variant.
- `origin`: Lọc theo xuất xứ.
- `tags`: Lọc theo tag, hỗ trợ chuỗi phân tách bằng dấu phẩy.
- `rating`: Lọc sản phẩm có `ratingAverage` lớn hơn hoặc bằng giá trị này.
- `inStock`: Nếu là `true`, chỉ trả sản phẩm còn hàng.
- `storeId`: Nếu truyền, chỉ trả sản phẩm còn hàng tại store đó.
- `sort`: `newest`, `oldest`, `price_asc`, `price_desc`, `best_selling`, `rating`, `sold_desc`, `rating_desc`.
- `page`: Trang hiện tại.
- `limit`: Số item mỗi trang.

Response danh sách có `meta` pagination gồm `page`, `limit`, `total`, `totalPages`.

## API Quản Trị

Các route quản trị nằm dưới `/api/v1/admin/products`.

- `GET /admin/products`: Lấy danh sách sản phẩm cho quản trị, trả tất cả status.
- `GET /admin/products/:slug`: Lấy chi tiết sản phẩm theo slug cho quản trị, trả được mọi status.
- `POST /admin/products`: Tạo sản phẩm.
- `PATCH /admin/products/:id`: Cập nhật sản phẩm.
- `DELETE /admin/products/:id`: Xóa sản phẩm, đồng thời xóa variants, images và combo items liên quan.
- `POST /admin/products/:id/combo-items`: Thêm sản phẩm thành phần vào combo.
- `PATCH /admin/products/combo-items/:comboItemId`: Cập nhật sản phẩm thành phần trong combo.
- `DELETE /admin/products/combo-items/:comboItemId`: Xóa sản phẩm thành phần khỏi combo.
- `POST /admin/products/:id/variants`: Tạo biến thể cho sản phẩm.
- `PATCH /admin/products/variants/:variantId`: Cập nhật biến thể.
- `DELETE /admin/products/variants/:variantId`: Xóa biến thể.
- `POST /admin/products/:id/images`: Thêm hình ảnh gallery/thumbnail sản phẩm.
- `DELETE /admin/products/images/:imageId`: Xóa hình ảnh sản phẩm.

### Danh Sách Sản Phẩm Quản Trị

Endpoint:

- `GET /api/v1/admin/products`

Endpoint này dùng cho màn hình quản trị sản phẩm và trả sản phẩm ở tất cả trạng thái:

- `DRAFT`
- `ACTIVE`
- `INACTIVE`
- `OUT_OF_STOCK`

Khác với API public `GET /api/v1/products`, API public chỉ trả sản phẩm có `status: "ACTIVE"`.

Query hỗ trợ giống API public:

- `keyword`
- `category`
- `brand`
- `minPrice`
- `maxPrice`
- `origin`
- `tags`
- `rating`
- `inStock`
- `storeId`
- `sort`
- `page`
- `limit`

Response có pagination và populate:

- `category`
- `brand`
- `variants`
- `images`
- `comboItems`

Ví dụ:

```json
{
  "success": true,
  "message": "Admin products fetched successfully",
  "data": [
    {
      "_id": "665f00000000000000000001",
      "name": "Rau muống sạch",
      "status": "DRAFT",
      "variants": [],
      "images": [],
      "comboItems": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Chi Tiết Sản Phẩm Quản Trị Theo Slug

Endpoint:

- `GET /api/v1/admin/products/:slug`

Endpoint này dùng cho màn hình xem/sửa chi tiết sản phẩm trong quản trị.
Khác với public API `GET /api/v1/products/:slug`, admin API không lọc theo `status`.

Admin có thể lấy chi tiết sản phẩm ở mọi trạng thái:

- `DRAFT`
- `ACTIVE`
- `INACTIVE`
- `OUT_OF_STOCK`

Response populate:

- `category`
- `brand`
- `variants`
- `images`
- `comboItems`

Ví dụ:

```json
{
  "success": true,
  "message": "Admin product fetched successfully",
  "data": {
    "_id": "665f00000000000000000001",
    "name": "Rau muống sạch",
    "slug": "rau-muong-sach",
    "status": "DRAFT",
    "category": {},
    "brand": {},
    "variants": [],
    "images": [],
    "comboItems": []
  }
}
```

## Populate Dữ Liệu

API public và admin populate:

- `category`
- `brand`
- `variants`
- `images`
- `comboItems`

`variants` có thể chứa `imageUrl` riêng của từng biến thể.

`comboItems` chỉ có dữ liệu khi product là combo hoặc có thành phần combo được cấu hình.
