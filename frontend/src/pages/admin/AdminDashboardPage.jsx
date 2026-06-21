import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Users, GitBranch, BarChart3, MessageSquare, FileText, Activity, Cpu, Server } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import StatCard from "../../components/ui/StatCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import ActivityChart from "../../components/charts/ActivityChart";
import { formatRelative, formatBytes } from "../../utils/format";
import { cn } from "../../utils/cn";

const STATUS_COLOR = {
  complete:  "badge-green",
  analyzing: "badge-blue",
  cloning:   "badge-blue",
  pending:   "badge-gray",
  error:     "badge-red",
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn:  adminApi.getStats,
    select:   (d) => d.data,
    refetchInterval: 30000,
  });

  const { data: sys } = useQuery({
    queryKey: ["admin", "system"],
    queryFn:  adminApi.getSystem,
    select:   (d) => d.data,
    refetchInterval: 15000,
  });

  const stats = data || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-muted mt-0.5">Platform-wide metrics and management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Users"        value={stats.totalUsers}          icon={Users}        color="brand" />
            <StatCard label="Active Users"        value={stats.activeUsers}         icon={Activity}     color="green" />
            <StatCard label="Total Repositories"  value={stats.totalRepos}          icon={GitBranch}    color="blue" />
            <StatCard label="Completed Analyses"  value={stats.completedAnalyses}   icon={BarChart3}    color="violet" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Reports Generated" value={stats.totalReports} icon={FileText}       color="orange" />
            <StatCard label="Chat Sessions"     value={stats.totalChats}   icon={MessageSquare}  color="brand" />
            {sys && <>
              <StatCard label="CPU Cores"  value={sys.cpus}  icon={Cpu}    color="blue" />
              <StatCard label="Memory Free" value={formatBytes(sys.memory?.free)} icon={Server} color="green" />
            </>}
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily registrations */}
        <div className="card p-5">
          <h2 className="section-title mb-4">User Registrations (7 days)</h2>
          <ActivityChart data={stats.dailyRegistrations || []} />
        </div>

        {/* Repository status breakdown */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Repository Status Breakdown</h2>
          {(stats.statusBreakdown || []).length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {(stats.statusBreakdown || []).map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className={cn("badge capitalize", STATUS_COLOR[s._id] || "badge-gray")}>{s._id}</span>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.count / (stats.totalRepos || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Recent Users</h2>
          <div className="space-y-2">
            {(stats.recentUsers || []).map((u) => (
              <div key={u._id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {u.role === "admin" && <span className="badge badge-purple text-xs">admin</span>}
                  <span className="text-xs text-gray-400">{formatRelative(u.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        {sys && (
          <div className="card p-5">
            <h2 className="section-title mb-4">System Information</h2>
            <div className="space-y-3">
              {[
                { label: "Node.js",    value: sys.node },
                { label: "Platform",   value: `${sys.platform} (${sys.arch})` },
                { label: "Uptime",     value: `${Math.floor(sys.uptime / 3600)}h ${Math.floor((sys.uptime % 3600) / 60)}m` },
                { label: "CPU Cores",  value: sys.cpus },
                { label: "Total RAM",  value: formatBytes(sys.memory?.total) },
                { label: "Free RAM",   value: formatBytes(sys.memory?.free) },
                { label: "Load Avg",   value: sys.loadAvg?.map((l) => l.toFixed(2)).join(", ") },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
