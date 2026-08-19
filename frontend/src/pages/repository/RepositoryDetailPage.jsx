import { useParams, Link, useNavigate } from "react-router-dom";
import { BarChart3, GitBranch, MessageSquare, FileText, RefreshCw, ArrowUpRight, Network, Trash2 } from "lucide-react";
import { useRepository, useRepoStatus, useDeleteRepo, useReAnalyze } from "../../hooks/useRepositories";
import { useAnalysis } from "../../hooks/useAnalysis";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import ProgressBar from "../../components/ui/ProgressBar";
import { formatNumber, formatRelative } from "../../utils/format";
import { useState } from "react";
import Modal from "../../components/ui/Modal";

const QUICK_LINKS = [
  { label: "Analysis",     icon: BarChart3,     path: "analysis" },
  { label: "Dependencies", icon: Network,       path: "dependencies" },
  { label: "AI Assistant", icon: MessageSquare, path: "chat" },
  { label: "Report",       icon: FileText,      path: "report" },
];

export default function RepositoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: repo, isLoading, error } = useRepository(id);
  const { data: status } = useRepoStatus(id, ["cloning", "analyzing", "pending"].includes(repo?.status));
  const { data: analysis } = useAnalysis(id);
  const deleteRepo = useDeleteRepo();
  const reAnalyze  = useReAnalyze();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const currentStatus = status?.status || repo?.status;
  const progress      = status?.progress || repo?.progress || 0;
  const isProcessing  = ["cloning", "analyzing", "pending"].includes(currentStatus);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)     return <ErrorMessage message="Repository not found" />;
  if (!repo)     return null;

  const metrics = analysis?.metrics;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-ink-300 mt-1 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="page-title">{repo.fullName}</h1>
              <RepoStatusBadge status={currentStatus} />
            </div>
            {repo.description && <p className="text-muted mt-1">{repo.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ArrowUpRight className="w-4 h-4" /> GitHub
          </a>
          <button onClick={() => reAnalyze.mutate(id)} className="btn-secondary" disabled={isProcessing || reAnalyze.isPending}>
            <RefreshCw className={`w-4 h-4 ${(isProcessing || reAnalyze.isPending) ? "animate-spin" : ""}`} />
            Re-analyze
          </button>
          <button onClick={() => setDeleteOpen(true)} className="btn-ghost text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar when processing */}
      {isProcessing && (
        <div className="border border-line dark:border-line-dark p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <p className="text-sm text-ink-700 dark:text-ink-200">
              {status?.statusMessage || "Processing…"}
            </p>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {/* Error state */}
      {currentStatus === "error" && (
        <div className="border border-red-200 dark:border-red-900/40 p-4">
          <p className="text-sm font-medium text-red-600 mb-1">Analysis failed</p>
          <p className="text-xs text-red-500">{repo.statusMessage}</p>
          <button onClick={() => reAnalyze.mutate(id)} className="btn-danger mt-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Quick links — plain row, not colored gradient cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-line dark:divide-line-dark border-t border-b border-line dark:border-line-dark">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          const disabled = currentStatus !== "complete";
          const to = link.path === "report" ? `/reports?repo=${id}` : `/repositories/${id}/${link.path}`;
          return (
            <Link
              key={link.path}
              to={disabled ? "#" : to}
              className={`flex flex-col items-center gap-2 py-5 text-center transition-colors ${
                disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-ink-50/60 dark:hover:bg-ink-800/40"
              }`}
              onClick={(e) => disabled && e.preventDefault()}
            >
              <Icon className="w-4.5 h-4.5 text-ink-500 dark:text-ink-400" strokeWidth={1.5} />
              <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Metrics summary (if available) */}
      {metrics && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Files",     value: formatNumber(metrics.totalFiles) },
            { label: "Folders",   value: formatNumber(metrics.totalFolders) },
            { label: "Lines",     value: formatNumber(metrics.totalLines) },
            { label: "Languages", value: metrics.languageStats?.length || 0 },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-lg font-serif text-ink-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tech stack */}
      {analysis?.techStack?.length > 0 && (
        <div>
          <h2 className="section-title mb-3">Tech stack</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {analysis.techStack.map((t) => (
              <span key={t.name} className="text-sm text-ink-700 dark:text-ink-200">
                {t.name}
                {t.version && <span className="text-ink-400 ml-1">v{t.version}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div>
          <h2 className="section-title mb-3">Summary</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      <p className="text-xs text-ink-300">Imported {formatRelative(repo.createdAt)}</p>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete repository">
        <p className="text-sm text-ink-500 mb-5">
          Delete <strong className="text-ink-900 dark:text-white">{repo.fullName}</strong> and all analysis data? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteRepo.mutate(id, { onSuccess: () => navigate("/repositories") }); setDeleteOpen(false); }} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
