import type { AxiosRequestConfig, Method } from "axios";
import { axiosClient } from "@/lib/axios";
import type { ApiResponse } from "@/services/types";

type BackendEnvelope<T> = Partial<ApiResponse<T>> & {
  data?: T;
};

const normalizeResponse = <T>(payload: BackendEnvelope<T> | T): ApiResponse<T> => {
  if (
    payload &&
    typeof payload === "object" &&
    ("success" in payload || "message" in payload || "meta" in payload)
  ) {
    const envelope = payload as BackendEnvelope<T>;

    return {
      success: envelope.success ?? true,
      message: envelope.message ?? "OK",
      data: envelope.data as T,
      meta: envelope.meta,
    };
  }

  return {
    success: true,
    message: "OK",
    data: payload as T,
  };
};

const request = async <T>(
  method: Method,
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => {
  const response = await axiosClient.request<BackendEnvelope<T> | T>({
    ...config,
    method,
    url,
  });

  return normalizeResponse<T>(response.data);
};

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => request<T>("GET", url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>("POST", url, { ...config, data }),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>("PATCH", url, { ...config, data }),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>("PUT", url, { ...config, data }),
  delete: <T>(url: string, config?: AxiosRequestConfig) => request<T>("DELETE", url, config),
};
