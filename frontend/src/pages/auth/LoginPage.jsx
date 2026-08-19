import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="space-y-7">
      <div>
        <h1 className="font-serif text-2xl text-ink-900 dark:text-white">Welcome back</h1>
        <p className="text-ink-500 text-sm mt-1">Sign in to your DevLens account</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com" className="input" required autoFocus />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className="input pr-10" required />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 border border-red-200 dark:border-red-900/40 px-3 py-2">
            {error.response?.data?.message || "Login failed"}
          </p>
        )}

        <button type="submit" className="btn-primary w-full py-2.5" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : null}
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-ink-500">
        No account?{" "}
        <Link to="/register" className="text-ink-900 dark:text-white font-medium hover:underline">Create one</Link>
      </p>
    </div>
  );
}
