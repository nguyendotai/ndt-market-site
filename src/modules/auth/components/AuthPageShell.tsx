import Link from "next/link";
import { BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import { Logo } from "@/components/common/Logo";

type AuthPageShellProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

const benefits = [
  { icon: Truck, label: "Giao nhanh trong ngay" },
  { icon: BadgeCheck, label: "Hang tuoi moi moi ngay" },
  { icon: ShieldCheck, label: "Bao mat tai khoan khach hang" },
];

export function AuthPageShell({ children, title, description }: AuthPageShellProps) {
  return (
    <section className="grid min-h-dvh bg-background lg:grid-cols-[0.95fr_1.05fr]">
      <div className="hidden border-r bg-muted/50 p-8 lg:flex lg:flex-col">
        <Logo />
        <div className="flex flex-1 flex-col justify-center">
          <p className="mb-4 inline-flex w-fit rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
            FreshMart Customer
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-normal">
            Mua sam thuc pham tuoi gon hon cho moi bua an.
          </h1>
          <p className="mt-5 max-w-lg text-muted-foreground">
            Dang nhap de theo doi don hang, luu dia chi giao hang va nhan uu dai phu hop
            voi khu vuc cua ban.
          </p>
          <div className="mt-8 grid gap-3">
            {benefits.map((benefit) => (
              <div key={benefit.label} className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-primary">
                  <benefit.icon className="h-4 w-4" />
                </span>
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Quay ve trang chu
        </Link>
      </div>
      <div className="flex min-h-dvh flex-col px-4 py-5 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between lg:hidden">
          <Logo />
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Trang chu
          </Link>
        </div>
        <div className="grid flex-1 place-items-center py-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-normal">{title}</h2>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
