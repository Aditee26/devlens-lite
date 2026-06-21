import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { useAnalysis } from "../../hooks/useAnalysis";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import { cn } from "../../utils/cn";

const SEV_CFG = {
  critical: { cls: "border-red-500/30 bg-red-500/5",     badge: "badge-red",    icon: ShieldAlert,  label: "Critical" },
  high:     { cls: "border-orange-500/30 bg-orange-500/5", badge: "badge-yellow", icon: AlertTriangle, label: "High" },
  medium:   { cls: "border-yellow-500/30 bg-yellow-500/5", badge: "badge-blue",   icon: Info,          label: "Medium" },
  low:      { cls: "border-gray-500/20 bg-gray-500/5",    badge: "badge-gray",   icon: Shield,       label: "Low" },
};

function FindingCard({ finding, index }) {
  const cfg  = SEV_CFG[finding.severity] || SEV_CFG.low;
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      className={cn("card p-4 border", cfg.cls)}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0",
          finding.severity === "critical" ? "text-red-500" :
          finding.severity === "high"     ? "text-orange-500" :
          finding.severity === "medium"   ? "text-yellow-500" : "text-gray-400"
        )} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("badge", cfg.badge)}>{cfg.label}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{finding.type}</span>
          </div>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate mb-1">{finding.file}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{finding.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function SecurityPage() {
  const { id } = useParams();
  const { data: repo }     = useRepository(id);
  const { data: analysis, isLoading, error } = useAnalysis(id);

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error)     return <ErrorMessage message="Could not load security data" />;

  const findings   = analysis?.securityFindings || [];
  const bySeverity = (s) => findings.filter((f) => f.severity === s);
  const critical   = bySeverity("critical");
  const high       = bySeverity("high");
  const medium     = bySeverity("medium");
  const low        = bySeverity("low");

  const score = findings.length === 0 ? 100
    : Math.max(0, 100 - critical.length * 25 - high.length * 10 - medium.length * 4 - low.length * 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/repositories/${id}`} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="page-title">Security Scanner</h1>
          <p className="text-muted text-sm">{repo?.fullName}</p>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-4 text-center sm:col-span-1">
          <p className={cn("text-3xl font-bold", score >= 80 ? "text-emerald-500" : score >= 50 ? "text-yellow-500" : "text-red-500")}>{score}</p>
          <p className="text-xs text-gray-500 mt-1">Security Score</p>
        </div>
        {[
          { label: "Critical", count: critical.length, color: "text-red-500" },
          { label: "High",     count: high.length,     color: "text-orange-500" },
          { label: "Medium",   count: medium.length,   color: "text-yellow-500" },
          { label: "Low",      count: low.length,      color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {findings.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No security issues found"
          description="No hardcoded secrets, unsafe patterns, or vulnerabilities were detected."
        />
      ) : (
        <div className="space-y-6">
          {[
            { label: "Critical Issues", items: critical, show: true },
            { label: "High Severity",   items: high,     show: true },
            { label: "Medium Severity", items: medium,   show: true },
            { label: "Low Severity",    items: low,      show: true },
          ].filter((g) => g.items.length > 0).map((group) => (
            <div key={group.label}>
              <h2 className="section-title mb-3">{group.label} ({group.items.length})</h2>
              <div className="space-y-2">
                {group.items.map((f, i) => (
                  <FindingCard key={i} finding={f} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
