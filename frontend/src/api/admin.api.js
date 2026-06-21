import { apiClient } from "./client";

export const adminApi = {
  getStats:    ()               => apiClient.get("/admin/stats").then((r) => r.data),
  getSystem:   ()               => apiClient.get("/admin/system").then((r) => r.data),
  listUsers:   (params)         => apiClient.get("/admin/users", { params }).then((r) => r.data),
  getUser:     (id)             => apiClient.get(`/admin/users/${id}`).then((r) => r.data),
  updateUser:  (id, data)       => apiClient.patch(`/admin/users/${id}`, data).then((r) => r.data),
  deleteUser:  (id)             => apiClient.delete(`/admin/users/${id}`).then((r) => r.data),
  listRepos:   (params)         => apiClient.get("/admin/repositories", { params }).then((r) => r.data),
};
