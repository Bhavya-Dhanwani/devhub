import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { authApi } from "../api/auth.api";

const initialState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
  bootstrapped: false,
};

function getErrorMessage(action) {
  return action.payload || action.error?.message || "Something went wrong.";
}

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async () => authApi.me(),
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (values, { rejectWithValue }) => {
    try {
      return await authApi.signup(values);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (values, { rejectWithValue }) => {
    try {
      return await authApi.login(values);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

export const verifyEmailUser = createAsyncThunk(
  "auth/verifyEmail",
  async (values, { rejectWithValue }) => {
    try {
      return await authApi.verifyEmail(values);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = "authenticated";
      state.error = null;
      state.bootstrapped = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.bootstrapped = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.status = "authenticated";
        state.error = null;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.bootstrapped = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = "unauthenticated";
        state.error = null;
        state.bootstrapped = true;
      })
      .addCase(verifyEmailUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
      })
      .addMatcher(isAnyOf(signupUser.pending, loginUser.pending), (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(
        isAnyOf(signupUser.fulfilled, loginUser.fulfilled),
        (state, action) => {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.status = "authenticated";
          state.error = null;
          state.bootstrapped = true;
        },
      )
      .addMatcher(isAnyOf(signupUser.rejected, loginUser.rejected), (state, action) => {
        state.status = "unauthenticated";
        state.error = getErrorMessage(action);
        state.bootstrapped = true;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
