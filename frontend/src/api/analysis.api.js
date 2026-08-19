import { apiClient } from "./client";

export const analysisApi = {
  getByRepo: (repoId) => apiClient.get(`/analysis/repository/${repoId}`).then((r) => r.data),
  getById:   (id)     => apiClient.get(`/analysis/${id}`).then((r) => r.data),
};
