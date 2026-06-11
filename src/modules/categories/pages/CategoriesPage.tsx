import Link from "next/link";
import { categoryMenu } from "@/configs/menu";

export function CategoriesPage() {
  return (
    <section className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-normal">Danh muc san pham</h1>
        <p className="mt-2 text-muted-foreground">Chon nhanh nhom hang can mua.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categoryMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md border bg-card p-5 transition-colors hover:bg-accent"
          >
            <item.icon className="h-5 w-5 text-primary" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
