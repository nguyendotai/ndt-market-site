import { ProtectedRoute } from "@/modules/auth/components/ProtectedRoute";
import { AccountPage } from "@/modules/account";

export default function Page() {
  return (
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  );
}
