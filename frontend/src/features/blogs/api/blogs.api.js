import { apiClient } from "@/core/api/apiClient";

export const blogsApi = {
  async create(values) {
    const formData = new window.FormData();
    formData.append("title", values.title);
    formData.append("heading", values.heading || values.title);
    formData.append("subheading", values.subheading);
    formData.append("content", values.content);
    formData.append("category", values.category);
    formData.append("tags", values.tags);
    formData.append("status", values.status);

    if (values.coverImage) {
      formData.append("coverImage", values.coverImage);
    }

    const response = await apiClient.post("/blogs", formData);
    return response.data.data.blog;
  },

  async getAll(params = {}) {
    const response = await apiClient.get("/blogs", { params });
    return response.data.data;
  },

  async getMine(params = {}) {
    const response = await apiClient.get("/blogs/me", { params });
    return response.data.data;
  },

  async getMineById(id) {
    const response = await apiClient.get(`/blogs/me/${id}`);
    return response.data.data.blog;
  },

  async getBySlug(slug) {
    const response = await apiClient.get(`/blogs/${slug}`);
    return response.data.data.blog;
  },

  async addView(id) {
    await apiClient.patch(`/blogs/${id}/view`);
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/blogs/${id}`, { status });
    return response.data.data.blog;
  },

  async update(id, values) {
    const formData = new window.FormData();

    if (values.title !== undefined) {
      formData.append("title", values.title);
    }

    if (values.heading !== undefined) {
      formData.append("heading", values.heading || values.title);
    }

    if (values.subheading !== undefined) {
      formData.append("subheading", values.subheading);
    }

    if (values.content !== undefined) {
      formData.append("content", values.content);
    }

    if (values.category !== undefined) {
      formData.append("category", values.category);
    }

    if (values.tags !== undefined) {
      formData.append("tags", values.tags);
    }

    if (values.status !== undefined) {
      formData.append("status", values.status);
    }

    if (values.coverImage) {
      formData.append("coverImage", values.coverImage);
    }

    const response = await apiClient.patch(`/blogs/${id}`, formData);
    return response.data.data.blog;
  },

  async delete(id) {
    const response = await apiClient.delete(`/blogs/${id}`);
    return response.data;
  },
};
