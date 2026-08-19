import Spinner from "./Spinner";

export default function StatCard({ label, value, trend, loading }) {
  return (
    <div>
      <p className="text-xs text-ink-400 uppercase tracking-wide">{label}</p>
      {loading ? (
        <div className="mt-2"><Spinner size="sm" /></div>
      ) : (
        <p className="mt-1 font-serif text-3xl text-ink-900 dark:text-white">{value ?? "—"}</p>
      )}
      {trend !== undefined && !loading && (
        <p className={`text-xs mt-1 ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {trend >= 0 ? "+" : ""}{trend}% from last week
        </p>
      )}
    </div>
  );
}
