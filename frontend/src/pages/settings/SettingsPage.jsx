import { useState } from "react";
import { Sun, Moon, Monitor, Trash2 } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useLogout } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { cn } from "../../utils/cn";
import Modal from "../../components/ui/Modal";

function Section({ title, description, children }) {
  return (
    <div className="py-6 border-b border-line dark:border-line-dark last:border-0">
      <div className="mb-4">
        <h2 className="section-title">{title}</h2>
        {description && <p className="text-muted mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const logout = useLogout();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const themes = [
    { value: "light",  icon: Sun,     label: "Light" },
    { value: "dark",   icon: Moon,    label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="max-w-xl">
      <div className="mb-2">
        <h1 className="page-title">Settings</h1>
        <p className="text-muted mt-1">Manage your account preferences</p>
      </div>

      <Section title="Appearance" description="Customize how DevLens looks">
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ value, icon: Icon, label }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={cn("flex items-center gap-2 p-2.5 border text-sm font-medium transition-colors",
                theme === value
                  ? "border-ink-800 dark:border-ink-100 text-ink-900 dark:text-white"
                  : "border-line dark:border-line-dark text-ink-500 hover:border-ink-400"
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Session" description="Manage your signed-in session">
        <button onClick={() => logout()} className="btn-secondary">
          Sign out
        </button>
      </Section>

      <Section title="Danger zone" description="Irreversible actions">
        <div className="border border-red-200 dark:border-red-900/40 p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-600">Delete account</p>
            <p className="text-xs text-red-500/80 mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button onClick={() => setDeleteOpen(true)} className="btn-danger flex-shrink-0 text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </Section>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <p className="text-sm text-ink-500 mb-2">
          This will permanently delete your account, all repositories, analyses, and reports.
        </p>
        <p className="text-sm font-medium text-red-600 mb-5">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => toast.error("Contact support to delete your account")} className="btn-danger">
            I understand, delete my account
          </button>
        </div>
      </Modal>
    </div>
  );
}
