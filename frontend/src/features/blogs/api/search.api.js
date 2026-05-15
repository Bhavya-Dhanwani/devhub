import { apiClient } from "@/core/api/apiClient";

export const searchApi = {
  async searchBlogs(params = {}) {
    const response = await apiClient.get("/search/blogs", { params });
    return response.data.data;
  },

  async getSuggestions(q) {
    const response = await apiClient.get("/search/suggestions", { params: { q } });
    return response.data.data.suggestions || [];
  },

  async getTrending() {
    const response = await apiClient.get("/search/trending");
    return response.data.data.trending || [];
  },

  async getRecent() {
    const response = await apiClient.get("/search/recent");
    return response.data.data.recent || [];
  },

  async clearRecent() {
    await apiClient.delete("/search/recent");
  },

  async trackClick(payload) {
    await apiClient.post("/search/click", payload);
  },
};
