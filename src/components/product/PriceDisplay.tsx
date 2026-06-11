import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PriceDisplayProps = {
  price: number;
  unit?: string;
  compareAtPrice?: number;
  className?: string;
};

export function PriceDisplay({ price, unit, compareAtPrice, className }: PriceDisplayProps) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className="font-semibold text-primary">{formatCurrency(price)}</span>
      {unit ? <span className="text-sm text-muted-foreground">/ {unit}</span> : null}
      {compareAtPrice ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(compareAtPrice)}
        </span>
      ) : null}
    </div>
  );
}
