"use client";

import { Toaster } from "sonner";
import { AuthBootstrap } from "@/modules/auth/components/AuthBootstrap";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </ReduxProvider>
  );
}
