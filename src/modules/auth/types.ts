export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF" | "SHIPPER" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export type AuthUser = {
  id?: string;
  _id?: string;
  fullName?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  permissions?: string[];
  status?: UserStatus;
  membershipTier?: string;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
