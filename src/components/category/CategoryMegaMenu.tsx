import Link from "next/link";
import { categoryMenu } from "@/configs/menu";

export function CategoryMegaMenu() {
  return (
    <div
      role="menu"
      className="invisible absolute left-0 top-full z-50 mt-2 w-[720px] rounded-md border bg-popover p-4 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      <div className="grid grid-cols-3 gap-4">
        {categoryMenu.slice(0, 6).map((item) => (
          <div key={item.href}>
            <Link
              role="menuitem"
              href={item.href}
              className="flex items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </Link>
            {item.children?.length ? (
              <div className="mt-1 grid gap-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
