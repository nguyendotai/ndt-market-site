import {
  Beef,
  BookOpen,
  Carrot,
  ChevronRight,
  Cookie,
  Gift,
  Home,
  Milk,
  PackageSearch,
  Sandwich,
  Search,
  ShoppingCart,
  Snowflake,
  Store,
  User,
  Wine,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type CategoryMenuItem = MenuItem & {
  count?: number;
  children?: Array<Omit<MenuItem, "icon"> & { count?: number }>;
};

export const mainMenu: MenuItem[] = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/products", label: "Sản phẩm", icon: PackageSearch },
  { href: "/categories", label: "Danh mục", icon: Store },
  { href: "/articles", label: "Cẩm nang", icon: BookOpen },
];

export const categoryMenu: CategoryMenuItem[] = [
  {
    href: "/categories/rau-cu",
    label: "Rau cu",
    icon: Carrot,
    count: 186,
    children: [
      { href: "/categories/rau-cu/rau-la", label: "Rau la", count: 48 },
      { href: "/categories/rau-cu/cu-qua", label: "Cu qua", count: 72 },
      { href: "/categories/rau-cu/nam", label: "Nam tuoi", count: 21 },
    ],
  },
  {
    href: "/categories/thit-ca",
    label: "Thit ca",
    icon: Beef,
    count: 132,
    children: [
      { href: "/categories/thit-ca/thit-heo", label: "Thit heo", count: 36 },
      { href: "/categories/thit-ca/thit-bo", label: "Thit bo", count: 24 },
      { href: "/categories/thit-ca/hai-san", label: "Hai san", count: 44 },
    ],
  },
  {
    href: "/categories/sua-trung",
    label: "Sua va trung",
    icon: Milk,
    count: 94,
    children: [
      { href: "/categories/sua-trung/sua-tuoi", label: "Sua tuoi", count: 28 },
      { href: "/categories/sua-trung/sua-chua", label: "Sua chua", count: 32 },
      { href: "/categories/sua-trung/trung", label: "Trung", count: 18 },
    ],
  },
  {
    href: "/categories/do-dong-lanh",
    label: "Do dong lanh",
    icon: Snowflake,
    count: 76,
    children: [
      { href: "/categories/do-dong-lanh/hai-san", label: "Hai san dong lanh", count: 24 },
      { href: "/categories/do-dong-lanh/vien-tha-lau", label: "Vien tha lau", count: 30 },
    ],
  },
  {
    href: "/categories/do-kho",
    label: "Do kho va gia vi",
    icon: Cookie,
    count: 210,
    children: [
      { href: "/categories/do-kho/gao-mi", label: "Gao, mi, bun", count: 54 },
      { href: "/categories/do-kho/gia-vi", label: "Gia vi", count: 88 },
      { href: "/categories/do-kho/do-hop", label: "Do hop", count: 38 },
    ],
  },
  {
    href: "/categories/do-uong",
    label: "Do uong",
    icon: Wine,
    count: 118,
    children: [
      { href: "/categories/do-uong/nuoc-ep", label: "Nuoc ep", count: 26 },
      { href: "/categories/do-uong/tra-ca-phe", label: "Tra va ca phe", count: 42 },
    ],
  },
  {
    href: "/categories/bua-an-nhanh",
    label: "Bua an nhanh",
    icon: Sandwich,
    count: 63,
    children: [
      { href: "/categories/bua-an-nhanh/combo", label: "Combo nau nhanh", count: 18 },
      { href: "/categories/bua-an-nhanh/che-bien-san", label: "Che bien san", count: 45 },
    ],
  },
  {
    href: "/promotions",
    label: "Khuyen mai",
    icon: Gift,
    count: 42,
    children: [
      { href: "/promotions/combo", label: "Combo tiet kiem", count: 20 },
      { href: "/promotions/voucher", label: "Voucher", count: 12 },
    ],
  },
];

export const categoryDisclosureIcon = ChevronRight;

export const mobileMenu: MenuItem[] = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/search", label: "Tìm kiếm", icon: Search },
  { href: "/categories", label: "Danh mục", icon: Store },
  { href: "/cart", label: "Gior hàng", icon: ShoppingCart },
  { href: "/account", label: "Tài khoản", icon: User },
];

export const policyLinks = [
  { href: "/articles/chinh-sach-doi-tra", label: "Doi tra va hoan tien" },
  { href: "/articles/giao-hang", label: "Giao hang" },
  { href: "/articles/thanh-toan", label: "Thanh toan" },
  { href: "/articles/bao-mat", label: "Bao mat thong tin" },
];
