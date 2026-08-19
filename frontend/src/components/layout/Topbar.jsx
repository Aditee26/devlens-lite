import { Menu, Sun, Moon, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const logout = useLogout();
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header className="h-14 bg-paper/95 dark:bg-ink-900/95 backdrop-blur border-b border-line dark:border-line-dark flex items-center gap-4 px-4 sm:px-6 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 -ml-1.5 text-ink-500 hover:text-ink-800 dark:hover:text-ink-100"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm font-medium text-ink-800 dark:text-ink-100 truncate flex-1">
        {title}
      </h1>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="flex items-center gap-2 p-1 rounded hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-ink-800 dark:bg-ink-100 text-white dark:text-ink-900 flex items-center justify-center text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-11 w-52 surface shadow-md z-20 py-1">
                <div className="px-4 py-2.5 border-b border-line dark:border-line-dark">
                  <p className="text-sm font-medium text-ink-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-ink-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={() => { setDropOpen(false); logout(); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
