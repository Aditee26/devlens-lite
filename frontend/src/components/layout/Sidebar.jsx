import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, GitBranch, BarChart3, MessageSquare,
  FileText, Settings, Shield, Users, ChevronRight,
  Cpu, Code2, BookOpen, X
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const NAV = [
  { label: "Dashboard",     to: "/dashboard",     icon: LayoutDashboard },
  { label: "Repositories",  to: "/repositories",  icon: GitBranch },
  { label: "Reports",       to: "/reports",       icon: FileText },
  { label: "Settings",      to: "/settings",      icon: Settings },
];

const ADMIN_NAV = [
  { label: "Overview",    to: "/admin",         icon: BarChart3 },
  { label: "Users",       to: "/admin/users",   icon: Users },
  { label: "Repos",       to: "/admin/repos",   icon: Code2 },
];

function NavItem({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        isActive
          ? "bg-brand-600/15 text-brand-400 border border-brand-500/20"
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
      )}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-brand-400" : "text-gray-500 group-hover:text-gray-300")} />
          <span className="truncate">{label}</span>
          {isActive && <ChevronRight className="w-3 h-3 ml-auto text-brand-500" />}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuthStore();

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">DevLens</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Lite Edition</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-3 py-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Main</p>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}

        {user?.role === "admin" && (
          <>
            <p className="px-3 py-1 mt-4 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Admin</p>
            {ADMIN_NAV.map((item) => (
              <NavItem key={item.to} {...item} onClick={onClose} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-800">
        <NavLink to="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          {user?.role === "admin" && (
            <span className="badge-purple text-[10px] flex-shrink-0">admin</span>
          )}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-gray-800 flex-shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-900 border-r border-gray-800 z-50"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
