import { cn } from "../../utils/cn";

export default function ProgressBar({ value = 0, label, color = "ink", showValue = true }) {
  const colors = {
    ink:    "bg-ink-700 dark:bg-ink-200",
    green:  "bg-emerald-600",
    yellow: "bg-amber-500",
    red:    "bg-red-600",
    blue:   "bg-accent-500",
  };
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-ink-500 dark:text-ink-400 truncate">{label}</span>}
          {showValue && <span className="text-xs font-medium text-ink-800 dark:text-ink-100 ml-2 tabular-nums">{pct}%</span>}
        </div>
      )}
      <div className="h-1 bg-ink-100 dark:bg-ink-800 overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", colors[color] || colors.ink)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
