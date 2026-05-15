import { apiClient } from "@/core/api/apiClient";

function createContentApi(basePath) {
  return {
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

    const response = await apiClient.post(basePath, formData);
    return response.data.data.blog;
  },

  async getAll(params = {}) {
    const response = await apiClient.get(basePath, { params });
    return response.data.data;
  },

  async getMine(params = {}) {
    const response = await apiClient.get(`${basePath}/me`, { params });
    return response.data.data;
  },

  async getMineById(id) {
    const response = await apiClient.get(`${basePath}/me/${id}`);
    return response.data.data.blog;
  },

  async getByUser(userId, params = {}) {
    const response = await apiClient.get(`${basePath}/user/${userId}`, { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`${basePath}/${id}`);
    return response.data.data.blog;
  },

  async addView(id) {
    await apiClient.patch(`${basePath}/${id}/view`);
  },

  async updateLike(id, liked) {
    const response = await apiClient.patch(`${basePath}/${id}/like`, { liked });
    return response.data.data;
  },

  async getSocialState(id) {
    const response = await apiClient.get(`${basePath}/${id}/social`);
    return response.data.data;
  },

  async updateBookmark(id, bookmarked) {
    const response = await apiClient.patch(`${basePath}/${id}/bookmark`, { bookmarked });
    return response.data.data;
  },

  async getComments(id, params = {}) {
    const response = await apiClient.get(`${basePath}/${id}/comments`, { params });
    return response.data.data;
  },

  async createComment(id, values) {
    const payload = typeof values === "string" ? { body: values } : values;
    const response = await apiClient.post(`${basePath}/${id}/comments`, payload);
    return response.data.data.comment;
  },

  async updateCommentLike(id, commentId, liked) {
    const response = await apiClient.patch(`${basePath}/${id}/comments/${commentId}/like`, { liked });
    return response.data.data;
  },

  async getBookmarks(params = {}) {
    const response = await apiClient.get(`${basePath}/bookmarks`, { params });
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`${basePath}/${id}`, { status });
    return response.data.data.blog;
  },

  async updateContentType(id, contentType) {
    const response = await apiClient.patch(`${basePath}/${id}/content-type`, { contentType });
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

    const response = await apiClient.patch(`${basePath}/${id}`, formData);
    return response.data.data.blog;
  },

  async delete(id) {
    const response = await apiClient.delete(`${basePath}/${id}`);
    return response.data;
  },
  };
}

export const blogsApi = createContentApi("/blogs");
export const projectsApi = createContentApi("/projects");
