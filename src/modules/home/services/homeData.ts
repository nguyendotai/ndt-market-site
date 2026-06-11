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
    name: "Rau muong VietGAP",
    category: "Rau cu",
    price: 12000,
    unit: "bo",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ca-hoi",
    name: "Ca hoi phi le",
    category: "Thit ca",
    price: 169000,
    unit: "300g",
    image:
      "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "cam-sanh",
    name: "Cam sanh mien Tay",
    category: "Trai cay",
    price: 39000,
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "sua-tuoi",
    name: "Sua tuoi thanh trung",
    category: "Sua va trung",
    price: 36000,
    unit: "hop 1L",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",
  },
];
