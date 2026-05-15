import { configureStore } from "@reduxjs/toolkit";
import { configureApiAuth } from "@/core/api/apiClient";
import authReducer, {
  clearCredentials,
  setCredentials,
} from "@/features/auth/state/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

configureApiAuth({
  getAccessToken: () => store.getState().auth.accessToken,
  onRefresh: (payload) => store.dispatch(setCredentials(payload)),
  onAuthFailure: () => store.dispatch(clearCredentials()),
});
