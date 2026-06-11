import type { HomeProduct } from "@/modules/home/types";

export const categories = [
  "Rau cu",
  "Thit ca",
  "Trai cay",
  "Sua va trung",
  "Gia vi",
  "Do uong",
];

export const featuredProducts: HomeProduct[] = [
  {
    id: "rau-muong",
    name: "Rau muong VietGAP tuoi moi moi ngay",
    category: "Rau cu",
    price: 12000,
    compareAtPrice: 18000,
    discountLabel: "-33%",
    promoNote: "Tiet kiem 6K",
    badge: "Online",
    unit: "bo",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ca-hoi",
    name: "Ca hoi phi le cat khay 300g",
    category: "Thit ca",
    price: 169000,
    compareAtPrice: 219000,
    discountLabel: "-23%",
    promoNote: "Giao nhanh 2 gio",
    badge: "Ban chay",
    unit: "300g",
    image:
      "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cam-sanh",
    name: "Cam sanh mien Tay tui 1kg",
    category: "Trai cay",
    price: 39000,
    compareAtPrice: 52000,
    discountLabel: "-25%",
    promoNote: "Uu dai online",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "sua-tuoi",
    name: "Sua tuoi thanh trung hop 1L",
    category: "Sua va trung",
    price: 36000,
    compareAtPrice: 42000,
    discountLabel: "-14%",
    promoNote: "Mua 2 tiet kiem hon",
    unit: "hop 1L",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "tom-su",
    name: "Tom su quang canh 20-25 con/kg",
    category: "Hai san",
    price: 349000,
    compareAtPrice: 475000,
    discountLabel: "-26%",
    promoNote: "Tiet kiem 126K",
    badge: "Tuoi song",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1504309250229-4f08315f3b5c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bo-mat",
    name: "De suon bo Uc goi 500g",
    category: "Thit ca",
    price: 269000,
    compareAtPrice: 299000,
    discountLabel: "-10%",
    promoNote: "Tiet kiem 30K",
    badge: "Nhap khau",
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "banh-mi",
    name: "Banh mi sandwich lua mach",
    category: "Banh tuoi",
    price: 29000,
    compareAtPrice: 39000,
    discountLabel: "-26%",
    promoNote: "Bua sang nhanh",
    unit: "goi",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "sua-chua",
    name: "Sua chua Hy Lap vi dau",
    category: "Sua va trung",
    price: 49000,
    compareAtPrice: 62000,
    discountLabel: "-21%",
    promoNote: "Lan dau mua gia tot",
    unit: "loc",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];
