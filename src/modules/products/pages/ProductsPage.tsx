import { ProductGrid } from "@/modules/products/components/ProductGrid";
import { featuredProducts } from "@/modules/home/services/homeData";

export function ProductsPage() {
  return (
    <section className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-normal">Tat ca san pham</h1>
        <p className="mt-2 text-muted-foreground">
          Trang danh sach co san layout de gan API, filter va phan trang.
        </p>
      </div>
      <ProductGrid products={featuredProducts} />
    </section>
  );
}
