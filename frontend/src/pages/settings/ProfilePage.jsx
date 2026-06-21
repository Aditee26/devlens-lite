import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, FileText, Save, Camera } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../api/client";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/format";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving]  = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const set  = (k) => (e) => setForm((f)   => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }));

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.patch("/auth/profile", { name: form.name, bio: form.bio });
      updateUser(data.data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    setSavingPw(true);
    try {
      await apiClient.patch("/auth/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      toast.success("Password changed");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-muted mt-0.5">Manage your personal information</p>
      </div>

      {/* Avatar + identity */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={user?.role === "admin" ? "badge badge-purple" : "badge badge-gray"}>
                {user?.role}
              </span>
              <span className="text-xs text-gray-400">Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={form.name} onChange={set("name")} className="input pl-10" required minLength={2} />
            </div>
          </div>
          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={user?.email || ""} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label">Bio</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <textarea value={form.bio} onChange={set("bio")} rows={3}
                placeholder="Tell us about yourself…"
                className="input pl-10 resize-none" maxLength={500} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Current password</label>
            <input type="password" value={pwForm.currentPassword} onChange={setPw("currentPassword")}
              className="input" required placeholder="Enter current password" />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" value={pwForm.newPassword} onChange={setPw("newPassword")}
              className="input" required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input type="password" value={pwForm.confirm} onChange={setPw("confirm")}
              className="input" required placeholder="Repeat new password" />
            {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPw || pwForm.newPassword !== pwForm.confirm} className="btn-primary">
              {savingPw ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
              {savingPw ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
