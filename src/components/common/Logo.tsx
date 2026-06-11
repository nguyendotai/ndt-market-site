import Link from "next/link";
import { Store } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Store className="h-5 w-5" />
      </span>
      <span className="hidden sm:inline">FreshMart</span>
    </Link>
  );
}
