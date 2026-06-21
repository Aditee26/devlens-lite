import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reposApi } from "../api/repositories.api";

export const REPO_KEYS = {
  all:    ["repositories"],
  list:   () => [...REPO_KEYS.all, "list"],
  detail: (id) => [...REPO_KEYS.all, id],
  status: (id) => [...REPO_KEYS.all, id, "status"],
};

export function useRepositories() {
  return useQuery({
    queryKey: REPO_KEYS.list(),
    queryFn:  reposApi.list,
    select:   (d) => d.data.repositories,
  });
}

export function useRepository(id) {
  return useQuery({
    queryKey: REPO_KEYS.detail(id),
    queryFn:  () => reposApi.get(id),
    enabled:  !!id,
    select:   (d) => d.data.repository,
  });
}

export function useRepoStatus(id, enabled = true) {
  return useQuery({
    queryKey: REPO_KEYS.status(id),
    queryFn:  () => reposApi.status(id),
    enabled:  !!id && enabled,
    refetchInterval: (data) => {
      const status = data?.data?.status;
      return status === "cloning" || status === "analyzing" || status === "pending" ? 2000 : false;
    },
    select: (d) => d.data,
  });
}

export function useImportRepo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (githubUrl) => reposApi.create({ githubUrl }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: REPO_KEYS.list() });
      toast.success(`Importing ${data.data.repository.fullName}…`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Import failed"),
  });
}

export function useDeleteRepo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reposApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: REPO_KEYS.list() });
      toast.success("Repository deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });
}

export function useReAnalyze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reposApi.analyze,
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: REPO_KEYS.detail(id) });
      toast.success("Re-analysis started");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to start analysis"),
  });
}
