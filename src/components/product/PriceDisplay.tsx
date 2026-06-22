import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PriceDisplayProps = {
  price: number;
  unit?: string;
  compareAtPrice?: number;
  className?: string;
};

export function PriceDisplay({ price, unit, compareAtPrice, className }: PriceDisplayProps) {
  const visibleCompareAtPrice =
    compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined;

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-semibold text-primary">{formatCurrency(price)}</span>
      {visibleCompareAtPrice ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(visibleCompareAtPrice)}
        </span>
      ) : null}
    </div>
  );
}
