import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-gray-400 text-sm mt-1">Start analyzing repositories in minutes</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label text-gray-300">Full name</label>
          <input type="text" value={form.name} onChange={set("name")} placeholder="Ada Lovelace"
            className="input" required minLength={2} autoFocus />
        </div>
        <div>
          <label className="label text-gray-300">Email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
            className="input" required />
        </div>
        <div>
          <label className="label text-gray-300">Password</label>
          <div className="relative">
            <input type={show ? "text" : "password"} value={form.password} onChange={set("password")}
              placeholder="Min 6 characters" className="input pr-10" required minLength={6} />
            <button type="button" onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error.response?.data?.message || "Registration failed"}
          </p>
        )}

        <button type="submit" className="btn-primary w-full justify-center py-3 text-base" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : <UserPlus className="w-4 h-4" />}
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
}
