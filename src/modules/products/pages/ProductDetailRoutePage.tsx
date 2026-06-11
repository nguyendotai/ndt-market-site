import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ProductDetailPage } from "@/modules/products/pages/ProductDetailPage";

export function ProductDetailRoutePage({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-[70dvh] w-full" />}>
      <ProductDetailPage slug={slug} />
    </Suspense>
  );
}
