"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAppSelector } from "@/store/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitialized, status, user } = useAppSelector((state) => state.auth);
  const isCustomer = user?.role === "CUSTOMER";

  useEffect(() => {
    if (!isInitialized) return;

    if (status !== "authenticated" || !isCustomer) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isCustomer, isInitialized, pathname, router, status]);

  if (!isInitialized || status === "loading") {
    return (
      <div className="grid gap-4">
        <LoadingSkeleton className="h-12 w-48" />
        <LoadingSkeleton className="h-56 w-full" />
      </div>
    );
  }

  if (status !== "authenticated" || !isCustomer) {
    return null;
  }

  return children;
}
