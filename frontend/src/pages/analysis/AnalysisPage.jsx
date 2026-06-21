import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ArrowLeft, RefreshCw, Network, Shield, Bug } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository, useReAnalyze } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import ProgressBar from "../../components/ui/ProgressBar";
import LanguageChart from "../../components/charts/LanguageChart";
import MetricsRadarChart from "../../components/charts/MetricsRadarChart";
import FileTree from "../../components/features/FileTree";
import { formatNumber, formatBytes } from "../../utils/format";

export default function AnalysisPage() {
  const { id } = useParams();
  const { data: repo } = useRepository(id);
  const { data: analysis, isLoading, error, refetch } = useAnalysis(id);
  const reAnalyze = useReAnalyze();

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Loading analysis…</p>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <Link to={`/repositories/${id}`} className="btn-ghost text-sm"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <ErrorMessage
        message={error.response?.data?.message || "Analysis not found. Try re-analyzing the repository."}
        onRetry={() => reAnalyze.mutate(id)}
      />
    </div>
  );

  const m = analysis?.metrics || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/repositories/${id}`} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">Analysis</h1>
            <p className="text-muted text-sm">{repo?.fullName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/repositories/${id}/dependencies`} className="btn-secondary text-sm"><Network className="w-4 h-4" /> Dependencies</Link>
          <Link to={`/repositories/${id}/security`}     className="btn-secondary text-sm"><Shield  className="w-4 h-4" /> Security</Link>
          <Link to={`/repositories/${id}/deadcode`}     className="btn-secondary text-sm"><Bug     className="w-4 h-4" /> Dead Code</Link>
          <button onClick={() => reAnalyze.mutate(id)} className="btn-secondary text-sm" disabled={reAnalyze.isPending}>
            <RefreshCw className={`w-4 h-4 ${reAnalyze.isPending ? "animate-spin" : ""}`} /> Re-analyze
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Files",    value: formatNumber(m.totalFiles)   },
          { label: "Total Folders",  value: formatNumber(m.totalFolders) },
          { label: "Lines of Code",  value: formatNumber(m.totalLines)   },
          { label: "Avg File Size",  value: formatBytes(m.avgFileSize)   },
          { label: "Complexity",     value: `${m.complexityScore ?? 0}/100` },
          { label: "Tech Debt",      value: `${m.technicalDebt  ?? 0}/100` },
        ].map((item) => (
          <div key={item.label} className="card p-4 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Language breakdown */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Language Breakdown</h2>
          <LanguageChart data={m.languageStats || []} />
          <div className="mt-4 space-y-2">
            {(m.languageStats || []).map((l) => (
              <ProgressBar key={l.language} label={`${l.language} (${l.files} files)`}
                value={l.percentage} color="brand" />
            ))}
          </div>
        </div>

        {/* Metrics radar */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Metrics Overview</h2>
          <MetricsRadarChart metrics={m} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Complexity Score</p>
              <ProgressBar value={m.complexityScore ?? 0} color={m.complexityScore > 70 ? "red" : m.complexityScore > 40 ? "yellow" : "green"} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Technical Debt</p>
              <ProgressBar value={m.technicalDebt ?? 0} color={m.technicalDebt > 60 ? "red" : m.technicalDebt > 30 ? "yellow" : "green"} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tech stack */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Technology Stack</h2>
          {(analysis?.techStack || []).length === 0 ? (
            <p className="text-sm text-gray-400">No technologies detected</p>
          ) : (
            <div className="space-y-2">
              {analysis.techStack.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      t.category === "frontend" ? "badge-blue" :
                      t.category === "backend"  ? "badge-green" :
                      t.category === "database" ? "badge-yellow" :
                      t.category === "language" ? "badge-purple" : "badge-gray"
                    }`}>{t.category}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</span>
                    {t.version && <span className="text-xs text-gray-400">v{t.version}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={t.confidence} showValue={false} color="brand" />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{t.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Largest files */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Largest Files</h2>
          {(m.largestFiles || []).length === 0 ? (
            <p className="text-sm text-gray-400">No file data available</p>
          ) : (
            <div className="space-y-2">
              {m.largestFiles.slice(0, 8).map((f, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate flex-1 mr-3">{f.path}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500">{formatNumber(f.lines)} lines</span>
                    <span className="text-xs text-gray-400">{formatBytes(f.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File tree */}
      <div className="card p-5">
        <h2 className="section-title mb-4">File Structure</h2>
        <FileTree tree={analysis?.fileTree} />
      </div>

      {/* Dependencies */}
      {(analysis?.dependencies || []).length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">External Dependencies ({analysis.dependencies.length})</h2>
            <Link to={`/repositories/${id}/dependencies`} className="text-sm text-brand-400 hover:text-brand-300">
              View graph →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.dependencies.map((dep) => (
              <span key={dep} className="badge badge-gray font-mono text-xs">{dep}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div className="card p-5 border-l-4 border-brand-500">
          <h2 className="section-title mb-3">AI Summary</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}
    </motion.div>
  );
}
