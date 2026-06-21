import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, GitBranch, Trash2, ExternalLink, BarChart3 } from "lucide-react";
import { useRepositories, useDeleteRepo } from "../../hooks/useRepositories";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import ImportRepoModal from "../../components/features/ImportRepoModal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { formatRelative } from "../../utils/format";
import Modal from "../../components/ui/Modal";

export default function RepositoriesPage() {
  const { data: repos = [], isLoading } = useRepositories();
  const deleteRepo = useDeleteRepo();
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const filtered = repos.filter((r) =>
    r.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Repositories</h1>
          <p className="text-muted mt-0.5">{repos.length} imported</p>
        </div>
        <button onClick={() => setImportOpen(true)} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" /> Import
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories…" className="input pl-10" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title={search ? "No matching repositories" : "No repositories yet"}
          description={search ? "Try a different search term" : "Import a GitHub repo to get started"}
          action={!search && (
            <button onClick={() => setImportOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Import
            </button>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((repo, i) => (
            <motion.div key={repo._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="card-hover p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <Link to={`/repositories/${repo._id}`}
                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-400 transition-colors truncate block">
                      {repo.fullName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{formatRelative(repo.createdAt)}</p>
                  </div>
                </div>
                <RepoStatusBadge status={repo.status} />
              </div>

              {repo.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{repo.description}</p>
              )}

              {repo.status === "error" && repo.statusMessage && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-2.5 py-1.5 mb-3 truncate">
                  ⚠ {repo.statusMessage}
                </p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {repo.status === "complete" && (
                  <Link to={`/repositories/${repo._id}/analysis`} className="btn-ghost text-xs py-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Analysis
                  </Link>
                )}
                <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-ghost text-xs py-1.5 ml-auto">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => setDeleteId(repo._id)}
                  className="btn-ghost text-xs py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ImportRepoModal open={importOpen} onClose={() => setImportOpen(false)} />

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Repository">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will delete the repository and all its analysis data. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteRepo.mutate(deleteId); setDeleteId(null); }} className="btn-danger">
            Delete
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
