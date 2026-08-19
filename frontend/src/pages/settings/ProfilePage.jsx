import { useState } from "react";
import { Save } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../api/client";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import { formatDate } from "../../utils/format";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const set   = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
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
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="text-muted mt-1">Manage your personal information</p>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-4 pb-6 border-b border-line dark:border-line-dark">
        <div className="w-12 h-12 rounded-full bg-ink-800 dark:bg-ink-100 text-white dark:text-ink-900 flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-medium text-ink-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-ink-400">{user?.email}</p>
          <p className="text-xs text-ink-300 mt-0.5">Joined {formatDate(user?.createdAt)}</p>
        </div>
      </div>

      {/* Details form */}
      <form onSubmit={saveProfile} className="space-y-4">
        <h2 className="section-title">Details</h2>
        <div>
          <label className="label">Full name</label>
          <input value={form.name} onChange={set("name")} className="input" required minLength={2} />
        </div>
        <div>
          <label className="label">Email address</label>
          <input value={user?.email || ""} disabled className="input opacity-60 cursor-not-allowed" />
          <p className="text-xs text-ink-400 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea value={form.bio} onChange={set("bio")} rows={3}
            placeholder="Tell us about yourself…"
            className="input resize-none" maxLength={500} />
          <p className="text-xs text-ink-400 mt-1">{form.bio.length}/500</p>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Change password */}
      <form onSubmit={changePassword} className="space-y-4 pt-6 border-t border-line dark:border-line-dark">
        <h2 className="section-title">Change password</h2>
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
            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
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
  );
}
