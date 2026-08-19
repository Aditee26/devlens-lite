import { apiClient } from "./client";

export const chatApi = {
  listSessions:  (repoId)              => apiClient.get(`/chat/repository/${repoId}`).then((r) => r.data),
  createSession: (repositoryId)        => apiClient.post("/chat/sessions", { repositoryId }).then((r) => r.data),
  getSession:    (id)                  => apiClient.get(`/chat/sessions/${id}`).then((r) => r.data),
  deleteSession: (id)                  => apiClient.delete(`/chat/sessions/${id}`).then((r) => r.data),
  sendMessage:   (sessionId, message)  => apiClient.post(`/chat/sessions/${sessionId}/message`, { message }).then((r) => r.data),
};
