import { apiClient } from "./client";

export const authApi = {
  register: (data) => apiClient.post("/auth/register", data).then((r) => r.data),
  login:    (data) => apiClient.post("/auth/login", data).then((r) => r.data),
  getMe:    () => apiClient.get("/auth/me").then((r) => r.data),
  updateProfile:  (data) => apiClient.patch("/auth/profile", data).then((r) => r.data),
  changePassword: (data) => apiClient.patch("/auth/password", data).then((r) => r.data),
};
