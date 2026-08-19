import { Link, Navigate } from "react-router-dom";
import { GitBranch, Network, Sparkles, FileText, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Import any repository",
    desc: "Paste a public GitHub URL and DevLens clones and analyzes it automatically.",
  },
  {
    icon: Network,
    title: "Tech & dependency insight",
    desc: "See detected technologies, file structure, and a visual dependency graph.",
  },
  {
    icon: Sparkles,
    title: "Ask the AI assistant",
    desc: "Get plain-language answers about the codebase, powered by Gemini.",
  },
  {
    icon: FileText,
    title: "Export a report",
    desc: "Download a clean PDF or JSON summary of the analysis to share.",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-paper">
      {/* Nav */}
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-lg text-ink-900">DevLens</span>
            <span className="text-[10px] text-ink-400 tracking-wide">LITE</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm text-ink-600 hover:text-ink-900">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16">
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-ink-900">
          Understand any repository in minutes
        </h1>
        <p className="mt-5 text-base text-ink-500 max-w-lg leading-relaxed">
          DevLens Lite imports a GitHub repository, detects its technologies, maps its
          dependencies, and lets you ask an AI assistant questions about the code.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link to="/register" className="btn-primary px-5 py-2.5">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-5 py-2.5">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border-t border-line">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4 py-6 border-b border-line">
              <f.icon className="w-4.5 h-4.5 text-ink-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-ink-900">{f.title}</p>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} DevLens Lite — a portfolio project.
      </footer>
    </div>
  );
}
