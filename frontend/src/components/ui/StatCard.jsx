import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

export default function StatCard({ label, value, icon: Icon, trend, color = "brand", loading }) {
  const colors = {
    brand:   "from-brand-500/10 to-brand-600/5 border-brand-500/20 text-brand-500",
    green:   "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-500",
    blue:    "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-500",
    orange:  "from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-500",
    red:     "from-red-500/10 to-red-600/5 border-red-500/20 text-red-500",
    violet:  "from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card p-5 bg-gradient-to-br", colors[color])}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{label}</p>
          {loading
            ? <div className="mt-2"><Spinner size="sm" /></div>
            : <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
          }
          {trend !== undefined && !loading && (
            <p className={cn("text-xs mt-1 font-medium", trend >= 0 ? "text-emerald-500" : "text-red-500")}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl bg-gradient-to-br flex-shrink-0", colors[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
