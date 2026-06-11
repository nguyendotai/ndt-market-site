# Module Sản Phẩm

Module Product quản lý sản phẩm, biến thể sản phẩm và hình ảnh sản phẩm cho website siêu thị online.

## Product Model

Model sản phẩm gồm:

- `category`: ObjectId danh mục sản phẩm, bắt buộc.
- `brand`: ObjectId thương hiệu sản phẩm, không bắt buộc và có thể là `null`.
- `name`: Tên sản phẩm, bắt buộc.
- `slug`: Slug tự động tạo từ `name`, không nhập từ form tạo.
- `sku`: Mã SKU unique và dùng để tìm kiếm. Backend tự sinh khi tạo sản phẩm nếu không gửi.
- `description`: Mô tả đầy đủ.
- `shortDescription`: Mô tả ngắn.
- `unit`: Đơn vị bán chính của sản phẩm.
- `origin`: Xuất xứ.
- `ingredients`: Danh sách thành phần.
- `storageInstruction`: Hướng dẫn bảo quản.
- `status`: `DRAFT`, `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`.
- `tags`: Danh sách tag phục vụ tìm kiếm và lọc.
- `soldCount`: Số lượng đã bán.
- `ratingAverage`: Điểm đánh giá trung bình.
- `ratingCount`: Số lượt đánh giá.

## ProductVariant Model

Model biến thể gồm:

- `product`: ObjectId sản phẩm.
- `name`: Tên biến thể, ví dụ `500g`, `1kg`, `Hộp 12 chai`.
- `barcode`: Mã barcode unique. Backend tự sinh khi tạo biến thể nếu không gửi.
- `imageUrl`: Ảnh riêng của biến thể, nên lấy từ API upload Cloudinary.
- `price`: Giá gốc.
- `salePrice`: Giá khuyến mãi, phải nhỏ hơn hoặc bằng `price`.
- `weight`: Khối lượng.
- `unit`: Đơn vị của biến thể.
- `status`: `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`.

## ProductImage Model

Model hình ảnh gồm:

- `product`: ObjectId sản phẩm.
- `imageUrl`: URL ảnh gallery/thumbnail cấp sản phẩm, nên lấy từ API upload Cloudinary.
- `isThumbnail`: Có phải ảnh đại diện hay không.
- `sortOrder`: Thứ tự hiển thị.

## Khác Nhau Giữa Ảnh Product Và Ảnh Variant

- `ProductImage`: Dùng cho gallery và thumbnail chung của sản phẩm.
- `ProductVariant.imageUrl`: Dùng cho ảnh riêng của từng biến thể, ví dụ cùng một sản phẩm nhưng biến thể khác màu, khác size, khác quy cách đóng gói.

Frontend nên ưu tiên hiển thị `variant.imageUrl` khi người dùng chọn biến thể. Nếu biến thể không có ảnh riêng, fallback về ảnh thumbnail trong `images`.

Khi cập nhật `ProductVariant.imageUrl`, backend sẽ xóa ảnh Cloudinary cũ. Khi xóa variant, product image hoặc product, backend cũng xóa các ảnh Cloudinary liên quan.

## Form Tạo Sản Phẩm

API tạo sản phẩm chỉ tạo dữ liệu Product. Biến thể và hình ảnh được tạo bằng API riêng sau khi đã có `_id` sản phẩm.

Endpoint:

- `POST /api/v1/admin/products`
- Auth required: Có.
- Role required: `ADMIN`, `STAFF`, hoặc `SUPER_ADMIN` có permission `catalog.manage`.

Payload phù hợp với model và validation hiện tại:

```json
{
  "category": "665f00000000000000000001",
  "brand": "665f00000000000000000002",
  "name": "Rau muống sạch",
  "description": "Rau muống sạch, tươi mỗi ngày, phù hợp cho bữa ăn gia đình.",
  "shortDescription": "Rau muống sạch, tươi ngon.",
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

Field bắt buộc khi tạo:

- `category`
- `name`

Lưu ý khi gửi từ form frontend:

- `category` phải là ObjectId hợp lệ của danh mục.
- `sku` có thể bỏ trống. Nếu không gửi hoặc gửi chuỗi rỗng `""`, backend tự tạo SKU unique.
- Nếu gửi `sku` thủ công, SKU sẽ được chuẩn hóa uppercase và phải unique.
- `brand` có thể bỏ trống. Nếu form gửi `brand` là chuỗi rỗng `""`, backend sẽ lưu là `null`.
- `ingredients` và `tags` có thể gửi dạng array hoặc chuỗi phân tách bằng dấu phẩy.
- Các field số như `soldCount`, `ratingAverage`, `ratingCount` có thể gửi dạng number hoặc chuỗi số từ input form.
- Nếu chưa cần quản lý thủ công, frontend có thể không gửi `soldCount`, `ratingAverage`, `ratingCount`; backend sẽ dùng mặc định từ model.

Field không gửi trong form tạo:

- `slug`: Backend tự generate từ `name`.
- `sku`: Có thể không gửi, backend tự generate.
- `variants`: Tạo bằng `POST /api/v1/admin/products/:id/variants`.
- `images`: Tạo bằng `POST /api/v1/admin/products/:id/images`.
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
  "price": 25000,
  "salePrice": 22000,
  "weight": 500,
  "unit": "g",
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
- `salePrice` không được lớn hơn `price`.
- `status` mặc định là `ACTIVE` nếu không truyền.
- `price`, `salePrice`, `weight` có thể gửi dạng number hoặc chuỗi số từ input form.

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

- `POST /admin/products`: Tạo sản phẩm.
- `PATCH /admin/products/:id`: Cập nhật sản phẩm.
- `DELETE /admin/products/:id`: Xóa sản phẩm, đồng thời xóa variants và images liên quan.
- `POST /admin/products/:id/variants`: Tạo biến thể cho sản phẩm.
- `PATCH /admin/products/variants/:variantId`: Cập nhật biến thể.
- `DELETE /admin/products/variants/:variantId`: Xóa biến thể.
- `POST /admin/products/:id/images`: Thêm hình ảnh gallery/thumbnail sản phẩm.
- `DELETE /admin/products/images/:imageId`: Xóa hình ảnh sản phẩm.

## Populate Dữ Liệu

API public populate `category`, `brand`, `variants` và `images` để frontend có đủ dữ liệu hiển thị.

`variants` có thể chứa `imageUrl` riêng của từng biến thể.
