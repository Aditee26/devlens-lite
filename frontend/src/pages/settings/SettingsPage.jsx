import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Bell, Shield, Trash2, Check } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { useLogout } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { cn } from "../../utils/cn";
import Modal from "../../components/ui/Modal";

function Section({ title, description, children }) {
  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="text-muted text-sm mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();
  const { user } = useAuthStore();
  const logout   = useLogout();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const themes = [
    { value: "light", icon: Sun,     label: "Light" },
    { value: "dark",  icon: Moon,    label: "Dark"  },
    { value: "system",icon: Monitor, label: "System" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-muted mt-0.5">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" description="Customize how DevLens looks">
        <div>
          <label className="label">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ value, icon: Icon, label }) => (
              <button key={value} onClick={() => setTheme(value)}
                className={cn("flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left",
                  theme === value
                    ? "border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
                {theme === value && <Check className="w-3.5 h-3.5 ml-auto text-brand-500" />}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications placeholder */}
      <Section title="Notifications" description="Control email and in-app notifications">
        <div className="space-y-3">
          {[
            { label: "Analysis complete",    desc: "Notify when a repository analysis finishes" },
            { label: "Security alerts",      desc: "Notify on critical security findings"       },
            { label: "Weekly digest",        desc: "Weekly summary of repository activity"      },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.label}</p>
                <p className="text-xs text-gray-500">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-brand-600 rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" description="Manage account security">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Account role</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <span className={user?.role === "admin" ? "badge-purple badge" : "badge-gray badge"}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="btn-secondary w-full justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
          >
            Sign out of all devices
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" description="Irreversible actions">
        <div className="border border-red-200 dark:border-red-900/30 rounded-xl p-4 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger flex-shrink-0 text-xs">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </Section>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          This will permanently delete your account, all repositories, analyses, and reports.
        </p>
        <p className="text-sm font-semibold text-red-500 mb-5">This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={() => toast.error("Contact support to delete your account")} className="btn-danger">
            I understand, delete my account
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
