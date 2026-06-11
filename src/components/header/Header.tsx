import Link from "next/link";
import { Suspense } from "react";
import { mainMenu } from "@/configs/menu";
import { Logo } from "@/components/common/Logo";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/header/SearchBar";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { CartButton } from "@/components/header/CartButton";
import { UserDropdown } from "@/components/header/UserDropdown";

export function Header() {
  return (
    <header className="hidden border-b bg-white lg:block">
      <Container size="wide" className="flex h-16 items-center gap-3">
        <Logo />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-10 rounded-md border bg-card" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav aria-label="Dieu huong chinh" className="hidden items-center gap-5 text-sm font-medium xl:flex">
          {mainMenu.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <CartButton />
        <UserDropdown />
      </Container>
    </header>
  );
}
