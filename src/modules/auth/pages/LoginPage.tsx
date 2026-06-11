import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { AuthPageShell } from "@/modules/auth/components/AuthPageShell";
import { GuestRoute } from "@/modules/auth/components/GuestRoute";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export function LoginPage() {
  return (
    <AuthPageShell
      title="Dang nhap"
      description="Truy cap tai khoan khach hang de tiep tuc mua sam va theo doi don hang."
    >
      <Suspense fallback={<LoadingSkeleton className="h-96 w-full max-w-md" />}>
        <GuestRoute>
          <LoginForm />
        </GuestRoute>
      </Suspense>
    </AuthPageShell>
  );
}
