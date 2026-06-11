export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type ListQueryParams = {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: unknown;
};

export type Id = string | number;

export type ApiErrorPayload = ApiResponse<null> & {
  status?: number;
};
