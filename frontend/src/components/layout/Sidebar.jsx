import { NavLink } from "react-router-dom";
import { LayoutDashboard, GitBranch, FileText, Settings, X } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils/cn";

const NAV = [
  { label: "Dashboard",    to: "/dashboard",    icon: LayoutDashboard },
  { label: "Repositories", to: "/repositories", icon: GitBranch },
  { label: "Reports",      to: "/reports",      icon: FileText },
  { label: "Settings",     to: "/settings",     icon: Settings },
];

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
        isActive
          ? "text-ink-900 dark:text-white font-medium bg-ink-100/70 dark:bg-ink-800"
          : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-800/60"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/dashboard" className="flex items-baseline gap-1.5">
          <span className="font-serif text-lg text-ink-900 dark:text-white">DevLens</span>
          <span className="text-[10px] text-ink-400 tracking-wide">LITE</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-ink-400 hover:text-ink-800 p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      <NavLink
        to="/profile"
        onClick={onClose}
        className="flex items-center gap-2.5 px-5 py-4 border-t border-line dark:border-line-dark hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-ink-800 dark:bg-ink-100 text-white dark:text-ink-900 flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-800 dark:text-ink-100 truncate leading-tight">{user?.name}</p>
          <p className="text-xs text-ink-400 truncate">{user?.email}</p>
        </div>
      </NavLink>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-paper dark:bg-ink-900 border-r border-line dark:border-line-dark flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div onClick={onClose} className="lg:hidden fixed inset-0 bg-black/40 z-40" />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-paper dark:bg-ink-900 border-r border-line dark:border-line-dark z-50">
            <SidebarContent onClose={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
