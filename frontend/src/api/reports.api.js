import { apiClient } from "./client";

export const reportsApi = {
  list:     ()                        => apiClient.get("/reports").then((r) => r.data),
  generate: (repositoryId, format)    => apiClient.post("/reports", { repositoryId, format }).then((r) => r.data),
  download: (id)                      => apiClient.get(`/reports/${id}/download`, { responseType: "blob" }),
  remove:   (id)                      => apiClient.delete(`/reports/${id}`).then((r) => r.data),
};
