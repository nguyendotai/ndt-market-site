"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { MobileHeader } from "@/components/header/MobileHeader";
import { cn } from "@/lib/utils";

const authRoutes = new Set(["/login", "/register", "/account/login"]);

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = authRoutes.has(pathname);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isAuthRoute) return;

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < 6) return;

      if (delta > 0 && currentScrollY > 24) {
        setHeaderVisible(false);
      } else if (delta < 0) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthRoute]);

  if (isAuthRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out will-change-transform",
          headerVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
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
