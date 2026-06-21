import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { mutate, isPending } = useForgotPassword();

  function submit(e) {
    e.preventDefault();
    mutate(email, { onSuccess: () => setSent(true) });
  }

  if (sent) return (
    <div className="space-y-6 text-center">
      <div className="w-14 h-14 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto">
        <Mail className="w-7 h-7 text-brand-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Check your inbox</h2>
        <p className="text-gray-400 text-sm mt-2">If <strong className="text-gray-200">{email}</strong> is registered, a reset link is on its way.</p>
      </div>
      <Link to="/login" className="btn-secondary inline-flex"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="text-gray-400 text-sm mt-1">Enter your email and we'll send a reset link.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label text-gray-300">Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" className="input" required autoFocus />
        </div>
        <button type="submit" className="btn-primary w-full justify-center py-3" disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : null}
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
    </div>
  );
}
