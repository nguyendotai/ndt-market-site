"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useAppSelector } from "@/store/hooks";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInitialized, status, user } = useAppSelector((state) => state.auth);
  const redirect = searchParams.get("redirect") || "/account";
  const isCustomer = user?.role === "CUSTOMER";

  useEffect(() => {
    if (!isInitialized) return;

    if (status === "authenticated" && isCustomer) {
      router.replace(redirect);
    }
  }, [isCustomer, isInitialized, redirect, router, status]);

  if (!isInitialized || status === "loading") {
    return (
      <div className="w-full max-w-md">
        <LoadingSkeleton className="h-96 w-full" />
      </div>
    );
  }

  if (status === "authenticated" && isCustomer) {
    return null;
  }

  return children;
}
