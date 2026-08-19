import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <AlertTriangle className="w-5 h-5 text-red-500 mb-3" strokeWidth={1.5} />
      <p className="text-sm font-medium text-ink-800 dark:text-ink-100 mb-1">Something went wrong</p>
      <p className="text-xs text-ink-400 max-w-xs mb-4">{message || "An unexpected error occurred"}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      )}
    </div>
  );
}
