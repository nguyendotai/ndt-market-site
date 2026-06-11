import { http } from "@/services/http";
import type { ChangePasswordPayload } from "@/modules/auth/types";
import type { LoginValues, RegisterValues } from "@/modules/auth/schemas/authSchema";
import type { AuthResponse, AuthUser } from "@/modules/auth/types";

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export const authService = {
  register: (payload: RegisterValues) => http.post<AuthResponse>("/auth/register", payload),
  login: (payload: LoginValues) => http.post<AuthResponse>("/auth/login", payload),
  me: () => http.get<AuthUser>("/auth/me"),
  logout: () => http.post<null>("/auth/logout"),
  changePassword: (payload: ChangePasswordPayload) =>
    http.patch<null>("/auth/change-password", payload),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    http.post<null>("/auth/forgot-password", payload),
  resetPassword: (payload: ResetPasswordPayload) =>
    http.post<null>("/auth/reset-password", payload),
  refreshToken: () => http.post<AuthResponse>("/auth/refresh-token"),
};
