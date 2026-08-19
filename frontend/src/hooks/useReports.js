import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reportsApi } from "../api/reports.api";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn:  reportsApi.list,
    select:   (d) => d.data.reports,
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, format }) => reportsApi.generate(repositoryId, format),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Report generation failed"),
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ id, filename, format }) => {
      const response = await reportsApi.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (err) => toast.error("Download failed"),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
  });
}
