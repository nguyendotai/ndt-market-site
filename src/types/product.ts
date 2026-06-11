export type Product = {
  id: string;
  _id?: string;
  slug?: string;
  name: string;
  description?: string;
  ingredients?: string;
  category:
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
  price: number;
  compareAtPrice?: number;
  discountLabel?: string;
  promoNote?: string;
  badge?: string;
  unit: string;
  origin?: string;
  storageInstruction?: string;
  inStock?: boolean;
  stock?: number;
  variants?: ProductVariant[];
  productVariants?: ProductVariant[];
  images?: string[];
  thumbnail?: string;
  image: string;
};

export type ProductVariant = {
  id: string;
  _id?: string;
  productId?: string;
  product?: string | Product;
  sku?: string;
  name: string;
  value: string;
  price?: number;
  salePrice?: number;
  compareAtPrice?: number;
  unit?: string;
  image?: string;
  images?: string[];
  inStock?: boolean;
  stock?: number;
};
