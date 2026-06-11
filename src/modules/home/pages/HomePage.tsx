import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ProductGrid } from "@/modules/products/components/ProductGrid";
import { categories, featuredProducts } from "@/modules/home/services/homeData";

const benefits = [
  { icon: Truck, title: "Giao nhanh 2 gio", text: "Don tuoi moi ngay tai cua hang gan ban." },
  { icon: ShieldCheck, title: "Nguon goc ro rang", text: "Hang hoa duoc chon loc theo tieu chuan an toan." },
  { icon: Clock, title: "Mo cua moi ngay", text: "Dat hang linh hoat cho bua an gia dinh." },
];

export function HomePage() {
  return (
    <div className="bg-background">
      <section className="container grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
            Sieu thi online cho bua an moi ngay
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-normal md:text-6xl">
            Di cho tuoi ngon, giao tan bep nha ban.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            FreshMart gom rau cu, thit ca, trai cay va hang tieu dung theo phong cach
            Kingfoodmart va Bach Hoa Xanh, toi uu cho mua sam nhanh.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">Mua sam ngay</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cart">Xem gio hang</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-md border bg-card">
            <Image
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80"
              alt="Quay rau cu tuoi trong sieu thi"
              width={1400}
              height={900}
              priority
              className="h-[360px] w-full object-cover md:h-[480px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border bg-card p-4">
              <p className="text-2xl font-bold">1.200+</p>
              <p className="text-sm text-muted-foreground">Mat hang moi ngay</p>
            </div>
            <div className="rounded-md border bg-card p-4">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <p className="text-2xl font-bold">24 quan</p>
              </div>
              <p className="text-sm text-muted-foreground">Vung giao noi thanh</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/40 py-12">
        <div className="container grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <benefit.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">{benefit.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-normal">Danh muc pho bien</h2>
            <p className="mt-2 text-muted-foreground">Sap xep theo thoi quen di cho hang ngay.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Xem tat ca</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category}
              href="/products"
              className="rounded-md border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="container pb-14">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-normal">San pham noi bat</h2>
          <p className="mt-2 text-muted-foreground">Du lieu mau san sang thay bang API cua ban.</p>
        </div>
        <ProductGrid products={featuredProducts} />
      </section>

      <section className="container pb-16">
        <Card>
          <CardContent className="grid gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <h2 className="text-2xl font-bold tracking-normal">Nhan deal theo khu vuc</h2>
              <p className="mt-2 text-muted-foreground">
                Form mau dung React Hook Form va Zod, hien toast bang Sonner.
              </p>
            </div>
            <NewsletterForm />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
