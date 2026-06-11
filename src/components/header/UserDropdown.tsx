"use client";

import Link from "next/link";
import { ChevronDown, LogOut, PackageCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function UserDropdown() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, user } = useAppSelector((state) => state.auth);
  const isLoggedIn = status === "authenticated" && user?.role === "CUSTOMER";

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Da dang xuat");
    router.push("/");
  };

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        className="hidden gap-2 lg:inline-flex"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <User className="h-4 w-4" />
        {isLoggedIn ? user.name : "Tai khoan"}
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Tai khoan">
        <User className="h-5 w-5" />
      </Button>
      <div
        role="menu"
        className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-popover p-2 opacity-0 shadow-md transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {isLoggedIn ? (
          <>
            <Link
              role="menuitem"
              href="/account"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Ho so tai khoan
            </Link>
            <Link
              role="menuitem"
              href="/orders"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <PackageCheck className="h-4 w-4 text-primary" />
              Don hang cua toi
            </Link>
            <button
              role="menuitem"
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 text-primary" />
              Dang xuat
            </button>
          </>
        ) : (
          <>
            <Link
              role="menuitem"
              href="/login"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Dang nhap
            </Link>
            <Link
              role="menuitem"
              href="/register"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Tao tai khoan
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
