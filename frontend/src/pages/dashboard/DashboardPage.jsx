import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, BarChart3, CheckCircle, Plus, ArrowRight, Clock } from "lucide-react";
import { useRepositories } from "../../hooks/useRepositories";
import StatCard from "../../components/ui/StatCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import ImportRepoModal from "../../components/features/ImportRepoModal";
import ActivityChart from "../../components/charts/ActivityChart";
import EmptyState from "../../components/ui/EmptyState";
import { formatRelative } from "../../utils/format";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: repos = [], isLoading } = useRepositories();
  const [importOpen, setImportOpen] = useState(false);

  const complete   = repos.filter((r) => r.status === "complete").length;
  const inProgress = repos.filter((r) => ["cloning","analyzing","pending"].includes(r.status)).length;
  const errors     = repos.filter((r) => r.status === "error").length;

  // Mock activity data based on repos
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { _id: d.toLocaleDateString("en-US",{weekday:"short"}), count: Math.floor(Math.random()*3) };
  });

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},{" "}
            <span className="text-gradient">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-muted mt-1">Here's what's happening with your repositories</p>
        </div>
        <button onClick={() => setImportOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Import Repo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Repositories" value={repos.length}  icon={GitBranch}    color="brand" />
            <StatCard label="Analyses Complete"  value={complete}       icon={CheckCircle}  color="green" />
            <StatCard label="In Progress"        value={inProgress}     icon={Clock}        color="blue" />
            <StatCard label="Errors"             value={errors}         icon={BarChart3}    color={errors > 0 ? "red" : "brand"} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent repos */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Repositories</h2>
            <Link to="/repositories" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{Array.from({length:4}).map((_,i) => <SkeletonCard key={i} />)}</div>
          ) : repos.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="No repositories yet"
              description="Import a GitHub repository to start analyzing"
              action={<button onClick={() => setImportOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Import</button>}
            />
          ) : (
            <div className="space-y-2">
              {repos.slice(0, 6).map((r) => (
                <Link key={r._id} to={`/repositories/${r._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-brand-400 transition-colors">
                      {r.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{formatRelative(r.createdAt)}</p>
                  </div>
                  <RepoStatusBadge status={r.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Weekly Activity</h2>
          <ActivityChart data={activityData} />
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-brand-500">{repos.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-emerald-500">{complete}</p>
              <p className="text-xs text-gray-500">Done</p>
            </div>
          </div>
        </div>
      </div>

      <ImportRepoModal open={importOpen} onClose={() => setImportOpen(false)} />
    </motion.div>
  );
}
