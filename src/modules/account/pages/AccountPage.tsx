"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/modules/auth/components/ChangePasswordForm";
import { logout } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AccountPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success("Da dang xuat");
    router.push("/");
  };

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Tai khoan</h1>
        <p className="mt-2 text-muted-foreground">
          Quan ly thong tin ca nhan, bao mat va lich su mua hang.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thong tin khach hang</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Ho ten:</span>{" "}
              <span className="font-medium">{user?.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium">{user?.email}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Vai tro:</span>{" "}
              <span className="font-medium">{user?.role}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Dang xuat
          </Button>
        </CardContent>
      </Card>
      <ChangePasswordForm />
    </section>
  );
}
