import { ProductListingPage } from "@/modules/products/pages/ProductListingPage";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim();

  return (
    <ProductListingPage
      key={query || "empty-search"}
      searchQueryParam="q"
      showSearchSections
      title={query ? `Ket qua tim kiem cho "${query}"` : "Tim kiem san pham"}
      description="Nhap tu khoa, loc danh muc, sap xep va tim san pham phu hop voi nhu cau mua sam."
    />
  );
}
