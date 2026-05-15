import { apiClient } from "@/core/api/apiClient";

export const authApi = {
  async signup(values) {
    const formData = new window.FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);

    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }

    const response = await apiClient.post("/auth/signup", formData);
    return response.data;
  },

  async login(values) {
    const response = await apiClient.post("/auth/login", values);
    return response.data;
  },

  async me() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async verifyEmail(values) {
    const response = await apiClient.post("/auth/verify-email", values);
    return response.data;
  },

  async resendVerificationOtp() {
    const response = await apiClient.post("/auth/resend-verification-otp");
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", {
      email,
      clientUrl: window.location.origin,
    });
    return response.data;
  },

  async resetPassword(values) {
    const response = await apiClient.post("/auth/reset-password", values);
    return response.data;
  },
};
