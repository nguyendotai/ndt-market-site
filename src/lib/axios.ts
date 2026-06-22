import axios from "axios";
import { env } from "@/configs/env";
import { authStorage } from "@/modules/auth/services/authStorage";
import type { ApiErrorPayload } from "@/services/types";

export const axiosClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const rawMessage = error?.response?.data?.message;
    const rawErrors = error?.response?.data?.errors;
    const backendMessage =
      typeof rawMessage === "string"
        ? rawMessage
        : Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : Array.isArray(rawErrors)
            ? rawErrors
                .map((item) =>
                  typeof item === "string" ? item : item?.message || item?.msg || item?.path,
                )
                .filter(Boolean)
                .join(", ")
            : undefined;
    const fallbackMessage =
      status === 401
        ? "Phien dang nhap da het han"
        : status === 403
          ? "Ban khong co quyen thuc hien thao tac nay"
          : status === 500
            ? "May chu dang gap su co"
            : error?.message || "Co loi xay ra";

    if (status === 401) {
      authStorage.clear();
    }

    const normalizedError: ApiErrorPayload = {
      success: false,
      message: backendMessage ?? fallbackMessage,
      data: null,
      meta: error?.response?.data?.meta,
      status,
    };

    error.normalized = normalizedError;
    error.message = normalizedError.message;

    return Promise.reject(error);
  },
);
