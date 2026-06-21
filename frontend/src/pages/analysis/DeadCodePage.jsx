import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bug, FileX, Import, FunctionSquare, Filter } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";

const TYPE_CFG = {
  file:     { icon: FileX,           label: "Unused File",     cls: "badge-red" },
  import:   { icon: Import,          label: "Unused Import",   cls: "badge-yellow" },
  function: { icon: FunctionSquare,  label: "Unused Export",   cls: "badge-blue" },
};

export default function DeadCodePage() {
  const { id } = useParams();
  const { data: repo }     = useRepository(id);
  const { data: analysis, isLoading, error } = useAnalysis(id);
  const [filter, setFilter] = useState("all");

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)     return <ErrorMessage message="Could not load dead code data" />;

  const all      = analysis?.deadCode || [];
  const filtered = filter === "all" ? all : all.filter((d) => d.type === filter);

  const counts = {
    file:     all.filter((d) => d.type === "file").length,
    import:   all.filter((d) => d.type === "import").length,
    function: all.filter((d) => d.type === "function").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/repositories/${id}`} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="page-title">Dead Code Detector</h1>
          <p className="text-muted text-sm">{repo?.fullName}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{all.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Issues</p>
        </div>
        {Object.entries(counts).map(([type, count]) => {
          const cfg = TYPE_CFG[type];
          const Icon = cfg.icon;
          return (
            <div key={type} className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{cfg.label}s</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {["all", "import", "function", "file"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("btn text-xs py-1.5 capitalize", filter === f ? "btn-primary" : "btn-secondary")}
          >
            {f === "all" ? `All (${all.length})` : `${TYPE_CFG[f]?.label}s (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* List */}
      {all.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No dead code found"
          description="No unused imports, files, or exported functions were detected."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bug} title={`No ${filter} issues`} description="Try a different filter" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">File</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Symbol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((item, i) => {
                const cfg  = TYPE_CFG[item.type] || TYPE_CFG.import;
                const Icon = cfg.icon;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={cn("badge gap-1", cfg.cls)}>
                        <Icon className="w-3 h-3" />
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate max-w-[200px] block">
                        {item.file}
                        {item.line ? `:${item.line}` : ""}
                      </code>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {item.symbol && (
                        <code className="text-xs font-mono text-brand-400">{item.symbol}</code>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">{item.message}</p>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
