import { CategorySidebar } from "@/components/category/CategorySidebar";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export type SidebarLayoutProps = {
  children: React.ReactNode;
  className?: string;
  sidebarLabel?: string;
};

export function SidebarLayout({
  children,
  className,
  sidebarLabel = "Danh muc san pham",
}: SidebarLayoutProps) {
  return (
    <Container size="wide" className={cn("px-0 py-4 lg:py-0", className)}>
      <div className="grid lg:grid-cols-[308px_minmax(0,1fr)]">
        <aside
          aria-label={sidebarLabel}
          className="relative z-30 hidden lg:block"
        >
          <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-visible">
            <CategorySidebar />
          </div>
        </aside>
        <div className="relative z-0 min-w-0 px-4 sm:px-5 lg:px-6 lg:py-6">{children}</div>
      </div>
    </Container>
  );
}
