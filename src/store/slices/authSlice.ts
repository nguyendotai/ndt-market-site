import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import type { LoginValues, RegisterValues } from "@/modules/auth/schemas/authSchema";
import { authService } from "@/modules/auth/services/authService";
import { authStorage } from "@/modules/auth/services/authStorage";
import type { AuthResponse, AuthUser, ChangePasswordPayload } from "@/modules/auth/types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isInitialized: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  isInitialized: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
};

const assertCustomer = (auth: AuthResponse) => {
  if (auth.user.role !== "CUSTOMER") {
    authStorage.clear();
    throw new Error("Chi tai khoan CUSTOMER duoc dung Client Site");
  }

  return auth;
};

const persistAuth = (auth: AuthResponse) => {
  authStorage.setAccessToken(auth.accessToken);
  authStorage.setUser(auth.user);
};

export const initializeAuth = createAsyncThunk<
  AuthResponse | null,
  void,
  { rejectValue: string }
>("auth/initialize", async (_, { rejectWithValue }) => {
  const accessToken = authStorage.getAccessToken();

  if (!accessToken) {
    authStorage.clear();
    return null;
  }

  try {
    const user = await authService.me();
    return assertCustomer({ accessToken, user });
  } catch (error) {
    authStorage.clear();
    return rejectWithValue(getErrorMessage(error, "Phien dang nhap khong hop le"));
  }
});

export const login = createAsyncThunk<AuthResponse, LoginValues, { rejectValue: string }>(
  "auth/login",
  async (values, { rejectWithValue }) => {
    try {
      const auth = assertCustomer(await authService.login(values));
      persistAuth(auth);
      return auth;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Dang nhap that bai"));
    }
  },
);

export const register = createAsyncThunk<AuthResponse, RegisterValues, { rejectValue: string }>(
  "auth/register",
  async (values, { rejectWithValue }) => {
    try {
      const auth = assertCustomer(await authService.register(values));
      persistAuth(auth);
      return auth;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Dang ky that bai"));
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await authService.logout();
  authStorage.clear();
});

export const changePassword = createAsyncThunk<
  void,
  ChangePasswordPayload,
  { rejectValue: string }
>("auth/changePassword", async (values, { rejectWithValue }) => {
  try {
    await authService.changePassword(values);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Doi mat khau that bai"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
      state.isInitialized = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.isInitialized = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload?.user ?? null;
        state.accessToken = action.payload?.accessToken ?? null;
        state.status = action.payload ? "authenticated" : "unauthenticated";
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.isInitialized = true;
        state.error = action.payload ?? "Phien dang nhap khong hop le";
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Dang nhap that bai";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Dang ky that bai";
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.isInitialized = true;
        state.error = null;
      });
  },
});

export const { clearCredentials, setCredentials } = authSlice.actions;
export default authSlice.reducer;
