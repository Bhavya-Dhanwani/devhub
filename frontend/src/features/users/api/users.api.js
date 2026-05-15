import { apiClient } from "@/core/api/apiClient";

export const usersApi = {
  async updateMe(values) {
    const formData = new window.FormData();
    formData.append("name", values.name || "");
    formData.append("username", values.username || "");
    formData.append("bio", values.bio || "");
    formData.append("skills", JSON.stringify(values.skills || []));
    formData.append("socialLinks", JSON.stringify(values.socialLinks || {}));
    formData.append("portfolio", JSON.stringify(values.portfolio || []));
    formData.append("removeAvatar", values.removeAvatar ? "true" : "false");
    formData.append("removeBanner", values.removeBanner ? "true" : "false");

    if (values.avatar) {
      formData.append("avatar", values.avatar);
    }

    if (values.banner) {
      formData.append("banner", values.banner);
    }

    const response = await apiClient.patch("/users/me", formData);
    return response.data.data.user;
  },
};
