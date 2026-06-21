import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Trash2, Plus, File, FileJson } from "lucide-react";
import { useReports, useGenerateReport, useDownloadReport, useDeleteReport } from "../../hooks/useReports";
import { useRepositories } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { formatRelative, formatBytes } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function ReportsPage() {
  const { data: reports = [],    isLoading }  = useReports();
  const { data: repos   = [] }               = useRepositories();
  const generateReport = useGenerateReport();
  const downloadReport = useDownloadReport();
  const deleteReport   = useDeleteReport();

  const [genOpen,  setGenOpen]  = useState(false);
  const [delId,    setDelId]    = useState(null);
  const [repoId,   setRepoId]   = useState("");
  const [format,   setFormat]   = useState("pdf");

  const completeRepos = repos.filter((r) => r.status === "complete");

  function handleGenerate() {
    if (!repoId) return;
    generateReport.mutate({ repositoryId: repoId, format }, {
      onSuccess: () => { setGenOpen(false); setRepoId(""); setFormat("pdf"); },
    });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-muted mt-0.5">{reports.length} report{reports.length !== 1 ? "s" : ""} generated</p>
        </div>
        <button onClick={() => setGenOpen(true)} className="btn-primary" disabled={completeRepos.length === 0}>
          <Plus className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports yet"
          description="Generate a PDF or JSON report from any completed analysis"
          action={
            <button onClick={() => setGenOpen(true)} disabled={completeRepos.length === 0} className="btn-primary">
              <Plus className="w-4 h-4" /> Generate Report
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, i) => (
            <motion.div key={report._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card-hover p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  report.format === "pdf" ? "bg-red-500/10 border border-red-500/20" : "bg-blue-500/10 border border-blue-500/20"
                )}>
                  {report.format === "pdf"
                    ? <File      className="w-5 h-5 text-red-500" />
                    : <FileJson  className="w-5 h-5 text-blue-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {report.repositoryId?.fullName || "Repository"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatRelative(report.createdAt)}</p>
                </div>
                <span className={cn("badge flex-shrink-0", report.format === "pdf" ? "badge-red" : "badge-blue")}>
                  {report.format.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Size</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatBytes(report.size)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Downloads</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.downloadCount || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadReport.mutate({ id: report._id, filename: report.filename, format: report.format })}
                  disabled={downloadReport.isPending}
                  className="btn-primary flex-1 justify-center text-xs py-2"
                >
                  {downloadReport.isPending ? <Spinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                  Download
                </button>
                <button onClick={() => setDelId(report._id)}
                  className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Generate modal */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate Report">
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
              <p className="text-xs text-yellow-500 mt-1">No completed analyses yet. Analyze a repository first.</p>
            )}
          </div>
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-2 gap-3">
              {["pdf","json"].map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={cn("flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all",
                    format === f
                      ? "border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                  )}>
                  {f === "pdf" ? <File className="w-5 h-5" /> : <FileJson className="w-5 h-5" />}
                  <div className="text-left">
                    <p className="text-sm font-semibold">{f.toUpperCase()}</p>
                    <p className="text-xs opacity-60">{f === "pdf" ? "Formatted report" : "Raw data"}</p>
                  </div>
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
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete Report">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Delete this report? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDelId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteReport.mutate(delId); setDelId(null); }} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
