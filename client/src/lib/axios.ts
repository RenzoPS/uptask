import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// Access token en memoria; refresh token via cookie HttpOnly.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const refreshSession = async (): Promise<string> => {
  const { data } = await axios.post<{ accessToken: string }>(
    `${baseURL}/auth/refresh-token`,
    {},
    { withCredentials: true },
  );
  return data.accessToken;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Evita bucles en endpoints públicos.
    const url = originalRequest.url ?? "";
    if (url.includes("/auth/login") || url.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshSession();
      setAccessToken(newToken);

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as Record<string, string>).Authorization =
        `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      window.location.href = "/auth/login";
      return Promise.reject(refreshError);
    }
  },
);

export default api;
