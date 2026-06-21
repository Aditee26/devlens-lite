import { apiClient } from "./client";

export const authApi = {
  register: (data) => apiClient.post("/auth/register", data).then((r) => r.data),
  login:    (data) => apiClient.post("/auth/login", data).then((r) => r.data),
  logout:   (refreshToken) => apiClient.post("/auth/logout", { refreshToken }).then((r) => r.data),
  refresh:  (refreshToken) => apiClient.post("/auth/refresh", { refreshToken }).then((r) => r.data),
  getMe:    () => apiClient.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword:  (token, password) => apiClient.post("/auth/reset-password", { token, password }).then((r) => r.data),
};
