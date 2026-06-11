export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type ProductVariantStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export type ProductCategoryRef =
  | string
  | {
      _id?: string;
      id?: string;
      parent?: string | null;
      name?: string;
      slug?: string;
      image?: string;
      sortOrder?: number;
      isActive?: boolean;
      createdAt?: string;
      updatedAt?: string;
    };

export type ProductBrandRef =
  | string
  | null
  | {
      _id?: string;
      id?: string;
      name?: string;
      slug?: string;
      logo?: string;
    };

export type ProductImage = {
  _id?: string;
  id?: string;
  product?: string;
  imageUrl: string;
  isThumbnail?: boolean;
  sortOrder?: number;
};

export type Product = {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  ingredients?: string;
  category: ProductCategoryRef;
  brand?: ProductBrandRef;
  price?: number;
  compareAtPrice?: number;
  discountLabel?: string;
  promoNote?: string;
  badge?: string;
  unit: string;
  origin?: string;
  storageInstruction?: string;
  status?: ProductStatus;
  tags?: string[];
  soldCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  inStock?: boolean;
  stock?: number;
  variants?: ProductVariant[];
  productVariants?: ProductVariant[];
  images?: Array<string | ProductImage>;
  thumbnail?: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductVariant = {
  id?: string;
  _id?: string;
  productId?: string;
  product?: string | Product;
  sku?: string;
  barcode?: string;
  name: string;
  value?: string;
  price?: number;
  salePrice?: number;
  compareAtPrice?: number;
  weight?: number;
  unit?: string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  inStock?: boolean;
  stock?: number;
  status?: ProductVariantStatus;
  createdAt?: string;
  updatedAt?: string;
};
