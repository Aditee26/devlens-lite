import { Outlet, Navigate, Link } from "react-router-dom";
import { GitBranch, Sparkles, FileText } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const FEATURES = [
  { icon: GitBranch, title: "Repository analysis", desc: "Scan structure, detect technologies, map dependencies." },
  { icon: Sparkles,  title: "AI-powered chat",      desc: "Ask anything about the repository, get instant answers." },
  { icon: FileText,  title: "Exportable reports",   desc: "Download a clean PDF or JSON summary of any analysis." },
];

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink-900">
      {/* Left panel — editorial, static, no decoration */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 border-r border-line dark:border-line-dark bg-ink-50/50 dark:bg-ink-800/30">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-serif text-xl text-ink-900 dark:text-white">DevLens</span>
          <span className="text-[10px] text-ink-400 tracking-wide">LITE</span>
        </Link>

        <div className="space-y-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <f.icon className="w-4.5 h-4.5 text-ink-500 dark:text-ink-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-ink-900 dark:text-white font-medium text-sm">{f.title}</p>
                <p className="text-ink-500 dark:text-ink-400 text-sm mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-ink-400 text-xs">© {new Date().getFullYear()} DevLens Lite</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
