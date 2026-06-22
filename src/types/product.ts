export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type ProductVariantStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type ProductType = "SIMPLE" | "COMBO";
export type ProductSaleType = "UNIT_PRODUCT" | "PACKAGED_WEIGHT_PRODUCT" | "WEIGHT_BASED_PRODUCT";
export type ProductInventoryType = "UNIT" | "WEIGHT";
export type ProductSellUnit = "PIECE" | "PACK" | "CAN" | "KILOGRAM" | string;
export type ProductInventoryUnit = "PIECE" | "GRAM" | string;
export type ProductPackageWeightUnit = "GRAM" | "KILOGRAM" | string;
export type ProductBarcodeType = "FIXED" | "SCALE_WEIGHT" | "SCALE_PRICE";

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
  createdAt?: string;
  updatedAt?: string;
};

export type ProductComboItem = {
  _id?: string;
  id?: string;
  comboProduct?: string | Product;
  product: string | Product;
  variant?: string | ProductVariant;
  quantity: number;
  quantityBase?: number;
  unitLabel?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  sku?: string;
  productType?: ProductType;
  description?: string;
  shortDescription?: string;
  ingredients?: string | string[];
  category: ProductCategoryRef;
  brand?: ProductBrandRef;
  unit: string;
  origin?: string;
  storageInstruction?: string;
  status?: ProductStatus;
  tags?: string[];
  soldCount?: number;
  ratingAverage?: number;
  ratingCount?: number;
  variants?: ProductVariant[];
  productVariants?: ProductVariant[];
  images?: Array<string | ProductImage>;
  comboItems?: ProductComboItem[];
  thumbnail?: string;
  image?: string;
  imageUrl?: string;
  price?: number;
  compareAtPrice?: number;
  discountLabel?: string;
  promoNote?: string;
  badge?: string;
  inStock?: boolean;
  stock?: number;
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
  image?: string;
  imageUrl?: string;
  images?: string[];
  saleType?: ProductSaleType;
  inventoryType?: ProductInventoryType;
  sellUnit?: ProductSellUnit;
  inventoryUnit?: ProductInventoryUnit;
  conversionRateToInventoryUnit?: number;
  packageWeight?: number;
  packageWeightUnit?: ProductPackageWeightUnit;
  price?: number;
  salePrice?: number;
  compareAtPrice?: number;
  weight?: number;
  unit?: string;
  allowDecimalQuantity?: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  stepQuantity?: number;
  barcodeType?: ProductBarcodeType;
  pluCode?: string;
  inStock?: boolean;
  stock?: number;
  status?: ProductVariantStatus;
  createdAt?: string;
  updatedAt?: string;
};
