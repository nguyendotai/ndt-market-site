import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export default function Page({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  void searchParams;

  return (
    <PlaceholderPage
      title="Tim kiem"
      description="Route search da san sang de gan API tim san pham theo tu khoa va bo loc."
    />
  );
}
