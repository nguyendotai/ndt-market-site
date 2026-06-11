"use client";

import { usePathname } from "next/navigation";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { MobileHeader } from "@/components/header/MobileHeader";

const authRoutes = new Set(["/login", "/register", "/account/login"]);

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.has(pathname);

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
        <Header />
        <MobileHeader />
      </div>
      <main className="pt-[116px] lg:pt-16">
        <SidebarLayout>{children}</SidebarLayout>
      </main>
      <Footer />
      <BottomNavigation />
    </>
  );
}
