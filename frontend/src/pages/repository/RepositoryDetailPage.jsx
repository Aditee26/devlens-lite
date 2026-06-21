import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, GitBranch, MessageSquare, Shield, Code2, FileText, RefreshCw, ExternalLink, Network, Trash2, Bug } from "lucide-react";
import { useRepository, useRepoStatus, useDeleteRepo, useReAnalyze } from "../../hooks/useRepositories";
import { useAnalysis } from "../../hooks/useAnalysis";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import ProgressBar from "../../components/ui/ProgressBar";
import { formatNumber, formatRelative, formatBytes } from "../../utils/format";
import { useState } from "react";
import Modal from "../../components/ui/Modal";

const QUICK_LINKS = [
  { label: "Analysis",        icon: BarChart3,     path: "analysis",      color: "brand" },
  { label: "Dependencies",    icon: Network,       path: "dependencies",  color: "blue" },
  { label: "Security",        icon: Shield,        path: "security",      color: "red" },
  { label: "Dead Code",       icon: Bug,           path: "deadcode",      color: "orange" },
  { label: "AI Chat",         icon: MessageSquare, path: "chat",          color: "violet" },
];

const QUICK_COLORS = {
  brand:  "bg-brand-600/10 border-brand-500/20 text-brand-500 hover:bg-brand-600/20",
  blue:   "bg-blue-600/10 border-blue-500/20 text-blue-500 hover:bg-blue-600/20",
  red:    "bg-red-600/10 border-red-500/20 text-red-500 hover:bg-red-600/20",
  orange: "bg-orange-600/10 border-orange-500/20 text-orange-500 hover:bg-orange-600/20",
  violet: "bg-violet-600/10 border-violet-500/20 text-violet-500 hover:bg-violet-600/20",
};

export default function RepositoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: repo, isLoading, error } = useRepository(id);
  const { data: status } = useRepoStatus(id, ["cloning","analyzing","pending"].includes(repo?.status));
  const { data: analysis } = useAnalysis(id);
  const deleteRepo = useDeleteRepo();
  const reAnalyze  = useReAnalyze();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const currentStatus = status?.status || repo?.status;
  const progress      = status?.progress || repo?.progress || 0;
  const isProcessing  = ["cloning","analyzing","pending"].includes(currentStatus);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)     return <ErrorMessage message="Repository not found" />;
  if (!repo)     return null;

  const metrics = analysis?.metrics;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{repo.fullName}</h1>
              <RepoStatusBadge status={currentStatus} />
            </div>
            {repo.description && <p className="text-muted mt-0.5 text-sm">{repo.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ExternalLink className="w-4 h-4" /> GitHub
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
        <div className="card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status?.statusMessage || "Processing…"}
            </p>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {/* Error state */}
      {currentStatus === "error" && (
        <div className="card p-4 border-red-500/30 bg-red-500/5">
          <p className="text-sm font-semibold text-red-500 mb-1">Analysis failed</p>
          <p className="text-xs text-red-400">{repo.statusMessage}</p>
          <button onClick={() => reAnalyze.mutate(id)} className="btn-danger mt-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          const disabled = currentStatus !== "complete";
          return (
            <Link
              key={link.path}
              to={disabled ? "#" : `/repositories/${id}/${link.path}`}
              className={`card p-4 flex flex-col items-center gap-2.5 border transition-all duration-150 text-center ${
                disabled ? "opacity-40 cursor-not-allowed" : QUICK_COLORS[link.color]
              }`}
              onClick={(e) => disabled && e.preventDefault()}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Metrics summary (if available) */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Files",      value: formatNumber(metrics.totalFiles) },
            { label: "Folders",    value: formatNumber(metrics.totalFolders) },
            { label: "Lines",      value: formatNumber(metrics.totalLines) },
            { label: "Languages",  value: metrics.languageStats?.length || 0 },
            { label: "Complexity", value: `${metrics.complexityScore}/100` },
            { label: "Debt",       value: `${metrics.technicalDebt}/100` },
          ].map((m) => (
            <div key={m.label} className="card p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tech stack */}
      {analysis?.techStack?.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.techStack.map((t) => (
              <span key={t.name} className={`badge ${
                t.category === "frontend" ? "badge-blue" :
                t.category === "backend"  ? "badge-green" :
                t.category === "database" ? "badge-yellow" :
                t.category === "language" ? "badge-purple" : "badge-gray"
              }`}>
                {t.name}
                {t.version && <span className="opacity-60 ml-1">v{t.version}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div className="card p-5">
          <h2 className="section-title mb-3">Summary</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Repository">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Delete <strong className="text-gray-900 dark:text-white">{repo.fullName}</strong> and all analysis data? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteRepo.mutate(id, { onSuccess: () => navigate("/repositories") }); setDeleteOpen(false); }} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </motion.div>
  );
}
