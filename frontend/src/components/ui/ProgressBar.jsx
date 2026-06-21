import { cn } from "../../utils/cn";

export default function ProgressBar({ value = 0, label, color = "brand", showValue = true }) {
  const colors = {
    brand:  "bg-brand-500",
    green:  "bg-emerald-500",
    yellow: "bg-yellow-500",
    red:    "bg-red-500",
    blue:   "bg-blue-500",
  };
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{label}</span>}
          {showValue && <span className="text-xs font-bold text-gray-900 dark:text-white ml-2">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
