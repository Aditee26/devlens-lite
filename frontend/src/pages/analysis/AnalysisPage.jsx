import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Network } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository, useReAnalyze } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import ProgressBar from "../../components/ui/ProgressBar";
import LanguageChart from "../../components/charts/LanguageChart";
import FileTree from "../../components/features/FileTree";
import { formatNumber, formatBytes } from "../../utils/format";

export default function AnalysisPage() {
  const { id } = useParams();
  const { data: repo } = useRepository(id);
  const { data: analysis, isLoading, error } = useAnalysis(id);
  const reAnalyze = useReAnalyze();

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-ink-400">Loading analysis…</p>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <Link to={`/repositories/${id}`} className="btn-ghost text-sm px-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <ErrorMessage
        message={error.response?.data?.message || "Analysis not found. Try re-analyzing the repository."}
        onRetry={() => reAnalyze.mutate(id)}
      />
    </div>
  );

  const m = analysis?.metrics || {};

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to={`/repositories/${id}`} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="page-title">Analysis</h1>
            <p className="text-muted">{repo?.fullName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/repositories/${id}/dependencies`} className="btn-secondary text-sm"><Network className="w-4 h-4" /> Dependencies</Link>
          <button onClick={() => reAnalyze.mutate(id)} className="btn-secondary text-sm" disabled={reAnalyze.isPending}>
            <RefreshCw className={`w-4 h-4 ${reAnalyze.isPending ? "animate-spin" : ""}`} /> Re-analyze
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-4 border-t border-b border-line dark:border-line-dark py-5">
        {[
          { label: "Total files",   value: formatNumber(m.totalFiles) },
          { label: "Total folders", value: formatNumber(m.totalFolders) },
          { label: "Lines of code", value: formatNumber(m.totalLines) },
          { label: "Avg file size", value: formatBytes(m.avgFileSize) },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xl font-serif text-ink-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-ink-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Language breakdown */}
      <div>
        <h2 className="section-title mb-4">Language breakdown</h2>
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <LanguageChart data={m.languageStats || []} />
          <div className="space-y-3">
            {(m.languageStats || []).map((l) => (
              <ProgressBar key={l.language} label={`${l.language} · ${l.files} files`}
                value={l.percentage} color="ink" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Tech stack */}
        <div>
          <h2 className="section-title mb-4">Technology stack</h2>
          {(analysis?.techStack || []).length === 0 ? (
            <p className="text-sm text-ink-400">No technologies detected</p>
          ) : (
            <div>
              {analysis.techStack.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-2 border-b border-line dark:border-line-dark last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-ink-400 uppercase tracking-wide w-16 flex-shrink-0">{t.category}</span>
                    <span className="text-sm font-medium text-ink-900 dark:text-white">{t.name}</span>
                    {t.version && <span className="text-xs text-ink-400">v{t.version}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <ProgressBar value={t.confidence} showValue={false} color="ink" />
                    </div>
                    <span className="text-xs text-ink-400 w-8 text-right tabular-nums">{t.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Largest files */}
        <div>
          <h2 className="section-title mb-4">Largest files</h2>
          {(m.largestFiles || []).length === 0 ? (
            <p className="text-sm text-ink-400">No file data available</p>
          ) : (
            <div>
              {m.largestFiles.slice(0, 8).map((f, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-line dark:border-line-dark last:border-0">
                  <p className="text-xs font-mono text-ink-600 dark:text-ink-300 truncate flex-1 mr-3">{f.path}</p>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-ink-400 tabular-nums">{formatNumber(f.lines)} lines</span>
                    <span className="text-xs text-ink-300 tabular-nums">{formatBytes(f.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File tree */}
      <div>
        <h2 className="section-title mb-4">File structure</h2>
        <div className="border border-line dark:border-line-dark">
          <FileTree tree={analysis?.fileTree} />
        </div>
      </div>

      {/* Dependencies */}
      {(analysis?.dependencies || []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">External dependencies ({analysis.dependencies.length})</h2>
            <Link to={`/repositories/${id}/dependencies`} className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-white">
              View graph →
            </Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {analysis.dependencies.map((dep) => (
              <span key={dep} className="font-mono text-xs text-ink-500 dark:text-ink-400">{dep}</span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis?.summary && (
        <div className="border-l-2 border-ink-800 dark:border-ink-100 pl-5">
          <h2 className="section-title mb-3">AI summary</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">{analysis.summary}</p>
        </div>
      )}
    </div>
  );
}
