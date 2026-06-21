import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useResetPassword } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const { mutate, isPending, error } = useResetPassword();

  function submit(e) {
    e.preventDefault();
    if (password !== confirm) return;
    mutate({ token, password });
  }

  if (!token) return (
    <div className="text-center space-y-4">
      <p className="text-red-400">Invalid or missing reset token.</p>
      <Link to="/forgot-password" className="btn-primary">Request new link</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="text-gray-400 text-sm mt-1">Choose a strong password for your account.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label text-gray-300">New password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              className="input pr-10" placeholder="Min 6 characters" required minLength={6} />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label text-gray-300">Confirm password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="input" placeholder="Repeat password" required />
          {confirm && password !== confirm && (
            <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error.response?.data?.message}</p>}
        <button type="submit" className="btn-primary w-full justify-center py-3"
          disabled={isPending || password !== confirm}>
          {isPending ? <Spinner size="sm" /> : <KeyRound className="w-4 h-4" />}
          {isPending ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
