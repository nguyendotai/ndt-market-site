export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF" | "SHIPPER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
