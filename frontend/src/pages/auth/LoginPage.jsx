import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useLogin } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const { mutate, isPending, error } = useLogin();

  function submit(e) {
    e.preventDefault();
    mutate(form);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to your DevLens account</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label text-gray-300">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com" className="input" required autoFocus />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label text-gray-300 mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot?</Link>
          </div>
          <div className="relative">
            <input type={show ? "text" : "password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className="input pr-10" required />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error.response?.data?.message || "Login failed"}
          </p>
        )}

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : <LogIn className="w-4 h-4" />}
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one</Link>
      </p>
    </div>
  );
}
