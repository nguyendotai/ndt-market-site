import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Container } from "@/components/layout/Container";
import { mainMenu, policyLinks } from "@/configs/menu";

export function Footer() {
  return (
    <footer className="border-t bg-muted/35 pb-20 pt-10 md:pb-10">
      <Container size="wide" className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            FreshMart cung cap thuc pham tuoi, hang tieu dung va dich vu giao hang
            nhanh cho gia dinh thanh thi.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Mua sam</h2>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {mainMenu.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Chinh sach</h2>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {policyLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Lien he</h2>
          <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              128 Nguyen Trai, Quan 1, TP.HCM
            </p>
            <p className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              1900 6868
            </p>
            <p className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              support@freshmart.vn
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
