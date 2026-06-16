"use client";

import { Toaster } from "sonner";
import { AuthBootstrap } from "@/modules/auth/components/AuthBootstrap";
import { CartBootstrap } from "@/modules/cart/components/CartBootstrap";
import { ReduxProvider } from "@/providers/ReduxProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthBootstrap>{children}</AuthBootstrap>
      <CartBootstrap />
      <Toaster richColors position="top-right" />
    </ReduxProvider>
  );
}
