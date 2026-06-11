import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearCart } from "@/store/slices/cartSlice";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";

export function CartSummary({ total }: { total: number }) {
  const dispatch = useAppDispatch();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Tam tinh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Tong cong</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button className="w-full">Thanh toan</Button>
        <Button variant="outline" className="w-full" onClick={() => dispatch(clearCart())}>
          Xoa gio hang
        </Button>
      </CardContent>
    </Card>
  );
}
