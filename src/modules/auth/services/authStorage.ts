import type { AuthUser } from "@/modules/auth/types";

const ACCESS_TOKEN_KEY = "freshmart_access_token";
const USER_KEY = "freshmart_user";

const canUseStorage = () => typeof window !== "undefined";

export const authStorage = {
  getAccessToken() {
    if (!canUseStorage()) return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  removeAccessToken() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getUser() {
    if (!canUseStorage()) return null;
    const rawUser = window.localStorage.getItem(USER_KEY);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      window.localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser(user: AuthUser) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(USER_KEY);
  },
  clear() {
    this.removeAccessToken();
    this.removeUser();
  },
};
