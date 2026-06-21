import { Outlet, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-gray-950 overflow-hidden">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-violet-900" />
        <div className="absolute inset-0 bg-grid-white opacity-30" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">DevLens Lite</span>
          </div>
          <p className="text-brand-200 text-sm">Understand any repo in minutes</p>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { icon: "🔍", title: "Deep Analysis", desc: "Scan structure, detect technologies, measure complexity" },
            { icon: "🤖", title: "AI-Powered Chat", desc: "Ask anything about the repository – get instant answers" },
            { icon: "📊", title: "Visual Insights", desc: "Dependency graphs, metrics dashboards, security reports" },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 backdrop-blur">
                {f.icon}
              </div>
              <div>
                <p className="text-white font-semibold">{f.title}</p>
                <p className="text-brand-200 text-sm mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="relative z-10 text-brand-300 text-xs">
          © {new Date().getFullYear()} DevLens Lite
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
