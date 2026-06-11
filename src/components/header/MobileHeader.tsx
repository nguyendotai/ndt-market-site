"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { SearchBar } from "@/components/header/SearchBar";
import { CartButton } from "@/components/header/CartButton";
import { CategorySidebar } from "@/components/category/CategorySidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b bg-background/95 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mo danh muc"
          aria-expanded={open}
          aria-controls="mobile-category-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Logo />
        <CartButton compact />
      </div>
      <div className="px-4 pb-3">
        <SearchBar compact />
      </div>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
      <div
        id="mobile-category-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Danh muc san pham"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] rounded-t-md border bg-background p-4 shadow-2xl transition-transform",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Danh muc san pham</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Dong
          </Button>
        </div>
        <div className="max-h-[68dvh] overflow-y-auto">
          <CategorySidebar activeHref="/categories" />
        </div>
      </div>
    </div>
  );
}
