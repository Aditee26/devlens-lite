import { useQuery } from "@tanstack/react-query";
import { analysisApi } from "../api/analysis.api";

export const ANALYSIS_KEYS = {
  byRepo: (id) => ["analysis", "repo", id],
  byId:   (id) => ["analysis", id],
};

export function useAnalysis(repoId) {
  return useQuery({
    queryKey: ANALYSIS_KEYS.byRepo(repoId),
    queryFn:  () => analysisApi.getByRepo(repoId),
    enabled:  !!repoId,
    select:   (d) => d.data.analysis,
    retry:    false,
  });
}

export function useAnalysisById(id) {
  return useQuery({
    queryKey: ANALYSIS_KEYS.byId(id),
    queryFn:  () => analysisApi.getById(id),
    enabled:  !!id,
    select:   (d) => d.data.analysis,
  });
}
