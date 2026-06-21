import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chatApi } from "../api/chat.api";

export const CHAT_KEYS = {
  sessions: (repoId) => ["chat", "sessions", repoId],
  session:  (id)     => ["chat", "session", id],
};

export function useChatSessions(repoId) {
  return useQuery({
    queryKey: CHAT_KEYS.sessions(repoId),
    queryFn:  () => chatApi.listSessions(repoId),
    enabled:  !!repoId,
    select:   (d) => d.data.sessions,
  });
}

export function useChatSession(id) {
  return useQuery({
    queryKey: CHAT_KEYS.session(id),
    queryFn:  () => chatApi.getSession(id),
    enabled:  !!id,
    select:   (d) => d.data.session,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createSession,
    onSuccess: (data) => {
      const repoId = data.data.session.repositoryId;
      qc.invalidateQueries({ queryKey: CHAT_KEYS.sessions(repoId) });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create session"),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "sessions"] });
      toast.success("Session deleted");
    },
  });
}

export function useSendMessage(sessionId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message) => chatApi.sendMessage(sessionId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHAT_KEYS.session(sessionId) });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Message failed"),
  });
}
