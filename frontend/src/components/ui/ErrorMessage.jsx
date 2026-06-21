import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Something went wrong</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">{message || "An unexpected error occurred"}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      )}
    </div>
  );
}
