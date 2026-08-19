import { Link } from "react-router-dom";
import { GitBranch, Plus, ArrowRight } from "lucide-react";
import { useRepositories } from "../../hooks/useRepositories";
import StatCard from "../../components/ui/StatCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import ImportRepoModal from "../../components/features/ImportRepoModal";
import EmptyState from "../../components/ui/EmptyState";
import { formatRelative } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: repos = [], isLoading } = useRepositories();
  const [importOpen, setImportOpen] = useState(false);

  const complete   = repos.filter((r) => r.status === "complete").length;
  const inProgress = repos.filter((r) => ["cloning", "analyzing", "pending"].includes(r.status)).length;
  const errors     = repos.filter((r) => r.status === "error").length;

  const langCounts = repos.reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted mt-1">Here's what's happening with your repositories.</p>
        </div>
        <button onClick={() => setImportOpen(true)} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" /> Import repo
        </button>
      </div>

      {/* Stats — inline row, divided by hairlines, not gradient cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-line dark:divide-line-dark border-t border-b border-line dark:border-line-dark py-5">
          <div className="px-4 first:pl-0"><StatCard label="Repositories" value={repos.length} /></div>
          <div className="px-4"><StatCard label="Analyses complete" value={complete} /></div>
          <div className="px-4"><StatCard label={errors > 0 ? "Errors" : "In progress"} value={errors > 0 ? errors : inProgress} /></div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Recent repos */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent repositories</h2>
            <Link to="/repositories" className="text-sm text-ink-500 hover:text-ink-900 dark:hover:text-white flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : repos.length === 0 ? (
            <div className="border border-line dark:border-line-dark">
              <EmptyState
                icon={GitBranch}
                title="No repositories yet"
                description="Import a GitHub repository to start analyzing"
                action={<button onClick={() => setImportOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Import</button>}
              />
            </div>
          ) : (
            <div className="border-t border-line dark:border-line-dark">
              {repos.slice(0, 6).map((r) => (
                <Link key={r._id} to={`/repositories/${r._id}`}
                  className="flex items-center gap-3 py-3 border-b border-line dark:border-line-dark hover:bg-ink-50/60 dark:hover:bg-ink-800/40 transition-colors group -mx-2 px-2">
                  <GitBranch className="w-4 h-4 text-ink-300 flex-shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-white truncate">
                      {r.fullName}
                    </p>
                    <p className="text-xs text-ink-400 truncate">{formatRelative(r.createdAt)}</p>
                  </div>
                  <RepoStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Technology snapshot */}
        <div>
          <h2 className="section-title mb-4">Top languages</h2>
          {topLanguages.length === 0 ? (
            <p className="text-sm text-ink-400">Import a repository to see language stats</p>
          ) : (
            <div className="space-y-3 border-t border-line dark:border-line-dark pt-3">
              {topLanguages.map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between text-sm">
                  <span className="text-ink-700 dark:text-ink-200">{lang}</span>
                  <span className="text-ink-400 tabular-nums">{count} repo{count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImportRepoModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
