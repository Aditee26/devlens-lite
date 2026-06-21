import { apiClient } from "./client";

export const reposApi = {
  list:     ()        => apiClient.get("/repositories").then((r) => r.data),
  get:      (id)      => apiClient.get(`/repositories/${id}`).then((r) => r.data),
  create:   (data)    => apiClient.post("/repositories", data).then((r) => r.data),
  remove:   (id)      => apiClient.delete(`/repositories/${id}`).then((r) => r.data),
  analyze:  (id)      => apiClient.post(`/repositories/${id}/analyze`).then((r) => r.data),
  status:   (id)      => apiClient.get(`/repositories/${id}/status`).then((r) => r.data),
};
