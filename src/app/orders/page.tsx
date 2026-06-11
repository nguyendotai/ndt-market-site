import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";
import { OrdersPage } from "@/modules/orders";

export default function Page() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
}
