import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";
import { CheckoutPage } from "@/modules/checkout";

export default function Page() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
