import { CategorySidebar } from "@/components/category/CategorySidebar";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export type SidebarLayoutProps = {
  children: React.ReactNode;
  className?: string;
  sidebarLabel?: string;
  headerVisible?: boolean;
};

export function SidebarLayout({
  children,
  className,
  sidebarLabel = "Danh muc san pham",
  headerVisible = true,
}: SidebarLayoutProps) {
  return (
    <Container size="wide" className={cn("px-0 py-4 lg:py-0", className)}>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label={sidebarLabel}
          className="relative z-30 hidden lg:block"
        >
          <div
            className={cn(
              "fixed left-0 w-[260px] overflow-visible transition-[top,height] duration-300 ease-out",
              headerVisible ? "top-16 h-[calc(100dvh-4rem)]" : "top-0 h-dvh",
            )}
          >
            <CategorySidebar showLogo={!headerVisible} />
          </div>
        </aside>
        <div className="relative z-0 min-w-0 px-4 sm:px-5 lg:px-6 lg:py-6">{children}</div>
      </div>
    </Container>
  );
}
