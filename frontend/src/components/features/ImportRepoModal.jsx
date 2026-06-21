import { useState } from "react";
import Modal from "../ui/Modal";
import { Github, ExternalLink } from "lucide-react";
import { useImportRepo } from "../../hooks/useRepositories";
import Spinner from "../ui/Spinner";

export default function ImportRepoModal({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const { mutate, isPending } = useImportRepo();

  function validate(v) {
    try {
      const u = new URL(v);
      if (u.hostname !== "github.com") return "Must be a github.com URL";
      const parts = u.pathname.replace(/^\//, "").split("/");
      if (parts.length < 2 || !parts[0] || !parts[1]) return "Format: github.com/owner/repo";
      return "";
    } catch (_) { return "Enter a valid URL"; }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate(url.trim());
    if (err) { setError(err); return; }
    mutate(url.trim(), { onSuccess: () => { setUrl(""); setError(""); onClose(); } });
  }

  return (
    <Modal open={open} onClose={onClose} title="Import GitHub Repository">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Paste a public GitHub repository URL. DevLens will clone and analyze it automatically.
        </p>
        <div>
          <label className="label">Repository URL</label>
          <div className="relative">
            <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="https://github.com/facebook/react"
              className="input pl-10"
              disabled={isPending}
              autoFocus
            />
          </div>
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Example repositories</p>
          {["https://github.com/facebook/react","https://github.com/expressjs/express","https://github.com/vercel/next.js"].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setUrl(ex)}
              className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-400 transition-colors w-full text-left truncate"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              {ex}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={!url.trim() || isPending}>
            {isPending ? <><Spinner size="sm" /> Importing…</> : "Import Repository"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
