import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api"),
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only clear token on 401 for non-auth endpoints (not password change etc.)
    if (err.response?.status === 401) {
      const url = err.config?.url || "";
      const isAuthAction = url.includes("/auth/password") || url.includes("/auth/signin");
      if (!isAuthAction) {
        localStorage.removeItem("auth_token");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
