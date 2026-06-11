import { ProductsPage } from "@/modules/products";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductsPage categorySlug={slug} />;
}
