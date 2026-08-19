import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useRegister } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const { mutate, isPending, error } = useRegister();

  function submit(e) {
    e.preventDefault();
    mutate(form);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-serif text-2xl text-ink-900 dark:text-white">Create your account</h1>
        <p className="text-ink-500 text-sm mt-1">Start analyzing repositories in minutes</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input type="text" value={form.name} onChange={set("name")} placeholder="Ada Lovelace"
            className="input" required minLength={2} autoFocus />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
            className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={form.password} onChange={set("password")}
              placeholder="Min 6 characters" className="input pr-10" required minLength={6} />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 border border-red-200 dark:border-red-900/40 px-3 py-2">
            {error.response?.data?.message || "Registration failed"}
          </p>
        )}

        <button type="submit" className="btn-primary w-full py-2.5" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : null}
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink-500">
        Already have an account?{" "}
        <Link to="/login" className="text-ink-900 dark:text-white font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
