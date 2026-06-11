"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/modules/auth/schemas/authSchema";
import { changePassword } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";

export function ChangePasswordForm() {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      toast.success("Da doi mat khau");
      reset();
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Doi mat khau that bai");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Doi mat khau</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mat khau hien tai</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currentPassword"
                type="password"
                className="pl-9"
                {...register("currentPassword")}
              />
            </div>
            {errors.currentPassword ? (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mat khau moi</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword ? (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xac nhan mat khau</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={isSubmitting}>
              Cap nhat mat khau
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
