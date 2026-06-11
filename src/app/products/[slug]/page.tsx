import { ProductDetailRoutePage } from "@/modules/products/pages/ProductDetailRoutePage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductDetailRoutePage slug={slug} />;
}
