import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api",
});

// Request interceptor - add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE || "http://localhost:8000/api"}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem("token", access);

        // Update authorization header for the original request
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(new Error("Token refresh failed"));
        isRefreshing = false;

        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API helpers
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => api.post("/auth/register/", data),

  login: (data: { username: string; password: string }) =>
    api.post("/auth/login/", data),

  logout: (refreshToken: string) =>
    api.post("/auth/logout/", { refresh: refreshToken }),

  getCurrentUser: () => api.get("/auth/me/"),

  updateProfile: (data: {
    email?: string;
    first_name?: string;
    last_name?: string;
  }) => api.patch("/auth/profile/", data),

  getProfile: () => api.get("/auth/profile/"),
};

export { api };
  