import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Download, Trash2, Plus } from "lucide-react";
import { useReports, useGenerateReport, useDownloadReport, useDeleteReport } from "../../hooks/useReports";
import { useRepositories } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { formatRelative, formatBytes } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const { data: reports = [], isLoading } = useReports();
  const { data: repos   = [] }            = useRepositories();
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();
  const deleteReport   = useDeleteReport();

  const [genOpen, setGenOpen] = useState(false);
  const [delId,   setDelId]   = useState(null);
  const [repoId,  setRepoId]  = useState("");
  const [format,  setFormat]  = useState("pdf");

  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (repoParam) {
      setRepoId(repoParam);
      setGenOpen(true);
    }
  }, [searchParams]);

  const completeRepos = repos.filter((r) => r.status === "complete");

  function handleGenerate() {
    if (!repoId) return;
    generateReport.mutate({ repositoryId: repoId, format }, {
      onSuccess: () => { setGenOpen(false); setRepoId(""); setFormat("pdf"); },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-muted mt-1">{reports.length} report{reports.length !== 1 ? "s" : ""} generated</p>
        </div>
        <button onClick={() => setGenOpen(true)} className="btn-primary" disabled={completeRepos.length === 0}>
          <Plus className="w-4 h-4" /> Generate report
        </button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : reports.length === 0 ? (
        <div className="border border-line dark:border-line-dark">
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Generate a PDF or JSON report from any completed analysis"
            action={
              <button onClick={() => setGenOpen(true)} disabled={completeRepos.length === 0} className="btn-primary">
                <Plus className="w-4 h-4" /> Generate report
              </button>
            }
          />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Repository</th>
              <th>Format</th>
              <th>Size</th>
              <th>Downloads</th>
              <th>Generated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="font-medium text-ink-900 dark:text-white">
                  {report.repositoryId?.fullName || "Repository"}
                </td>
                <td>
                  <span className="chip-neutral font-mono uppercase">{report.format}</span>
                </td>
                <td className="text-ink-400">{formatBytes(report.size)}</td>
                <td className="text-ink-400 tabular-nums">{report.downloadCount || 0}</td>
                <td className="text-ink-400 whitespace-nowrap">{formatRelative(report.createdAt)}</td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => downloadReport.mutate({ id: report._id, filename: report.filename, format: report.format })}
                      disabled={downloadReport.isPending}
                      className="btn-ghost px-2 py-1.5"
                      title="Download"
                    >
                      {downloadReport.isPending ? <Spinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setDelId(report._id)} className="btn-ghost px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Generate modal */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate report">
        <div className="space-y-4">
          <div>
            <label className="label">Repository</label>
            <select value={repoId} onChange={(e) => setRepoId(e.target.value)} className="input">
              <option value="">Select a repository…</option>
              {completeRepos.map((r) => (
                <option key={r._id} value={r._id}>{r.fullName}</option>
              ))}
            </select>
            {completeRepos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No completed analyses yet. Analyze a repository first.</p>
            )}
          </div>
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {["pdf", "json"].map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={cn("flex items-center justify-center gap-2 p-2.5 border text-sm font-medium transition-colors",
                    format === f
                      ? "border-ink-800 dark:border-ink-100 text-ink-900 dark:text-white"
                      : "border-line dark:border-line-dark text-ink-500 hover:border-ink-400"
                  )}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setGenOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleGenerate} disabled={!repoId || generateReport.isPending} className="btn-primary">
              {generateReport.isPending ? <Spinner size="sm" /> : <Plus className="w-4 h-4" />}
              {generateReport.isPending ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete report">
        <p className="text-sm text-ink-500 mb-5">Delete this report? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDelId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteReport.mutate(delId); setDelId(null); }} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
