import { axiosClient } from "@/lib/axios";
import type { LoginValues, RegisterValues } from "@/modules/auth/schemas/authSchema";
import type { AuthResponse, AuthUser, ChangePasswordPayload } from "@/modules/auth/types";

type RawAuthResponse = {
  accessToken?: string;
  token?: string;
  user?: AuthUser;
  data?: {
    accessToken?: string;
    token?: string;
    user?: AuthUser;
  };
};

type RawMeResponse = AuthUser | { data: AuthUser };

const normalizeAuthResponse = (payload: RawAuthResponse): AuthResponse => {
  const accessToken = payload.accessToken ?? payload.token ?? payload.data?.accessToken ?? payload.data?.token;
  const user = payload.user ?? payload.data?.user;

  if (!accessToken || !user) {
    throw new Error("Phan hoi dang nhap khong hop le");
  }

  return { accessToken, user };
};

export const authService = {
  async register(values: RegisterValues) {
    const response = await axiosClient.post<RawAuthResponse>("/auth/register", values);
    return normalizeAuthResponse(response.data);
  },
  async login(values: LoginValues) {
    const response = await axiosClient.post<RawAuthResponse>("/auth/login", values);
    return normalizeAuthResponse(response.data);
  },
  async me() {
    const response = await axiosClient.get<RawMeResponse>("/auth/me");
    const payload = response.data;
    return "data" in payload ? payload.data : payload;
  },
  async logout() {
    await axiosClient.post("/auth/logout").catch(() => undefined);
  },
  async changePassword(values: ChangePasswordPayload) {
    await axiosClient.patch("/auth/change-password", values);
  },
};
