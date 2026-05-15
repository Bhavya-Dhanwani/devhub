import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshPromise = null;
let getAccessToken = () => null;
let handleRefresh = () => {};
let handleAuthFailure = () => {};

export function configureApiAuth(handlers) {
  getAccessToken = handlers.getAccessToken;
  handleRefresh = handlers.onRefresh;
  handleAuthFailure = handlers.onAuthFailure;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshClient
        .post("/auth/refresh")
        .then((response) => response.data)
        .finally(() => {
          refreshPromise = null;
        });

      const payload = await refreshPromise;
      handleRefresh(payload);
      originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      handleAuthFailure();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
