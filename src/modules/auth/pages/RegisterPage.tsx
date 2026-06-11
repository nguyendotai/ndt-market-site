import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { AuthPageShell } from "@/modules/auth/components/AuthPageShell";
import { GuestRoute } from "@/modules/auth/components/GuestRoute";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export function RegisterPage() {
  return (
    <AuthPageShell
      title="Tao tai khoan"
      description="Dang ky tai khoan CUSTOMER de nhan uu dai va dat hang nhanh hon."
    >
      <Suspense fallback={<LoadingSkeleton className="h-96 w-full max-w-md" />}>
        <GuestRoute>
          <RegisterForm />
        </GuestRoute>
      </Suspense>
    </AuthPageShell>
  );
}
