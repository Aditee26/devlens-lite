import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, GitBranch, Trash2, ArrowUpRight, BarChart3 } from "lucide-react";
import { useRepositories, useDeleteRepo } from "../../hooks/useRepositories";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import ImportRepoModal from "../../components/features/ImportRepoModal";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Repositories</h1>
          <p className="text-muted mt-1">{repos.length} imported</p>
        </div>
        <button onClick={() => setImportOpen(true)} className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" /> Import
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories…" className="input pl-9" />
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : filtered.length === 0 ? (
        <div className="border border-line dark:border-line-dark">
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
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <table className="data-table hidden sm:table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Status</th>
                <th>Imported</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((repo) => (
                <tr key={repo._id}>
                  <td>
                    <Link to={`/repositories/${repo._id}`} className="font-medium text-ink-900 dark:text-white hover:underline">
                      {repo.fullName}
                    </Link>
                    {repo.description && (
                      <p className="text-xs text-ink-400 mt-0.5 truncate max-w-md">{repo.description}</p>
                    )}
                    {repo.status === "error" && repo.statusMessage && (
                      <p className="text-xs text-red-600 mt-0.5 truncate max-w-md">{repo.statusMessage}</p>
                    )}
                  </td>
                  <td><RepoStatusBadge status={repo.status} /></td>
                  <td className="text-ink-400 whitespace-nowrap">{formatRelative(repo.createdAt)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {repo.status === "complete" && (
                        <Link to={`/repositories/${repo._id}/analysis`} className="btn-ghost px-2 py-1.5" title="Analysis">
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2 py-1.5" title="Open on GitHub">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => setDeleteId(repo._id)} className="btn-ghost px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: stacked list */}
          <div className="sm:hidden border-t border-line dark:border-line-dark">
            {filtered.map((repo) => (
              <div key={repo._id} className="py-3.5 border-b border-line dark:border-line-dark">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/repositories/${repo._id}`} className="font-medium text-sm text-ink-900 dark:text-white truncate">
                    {repo.fullName}
                  </Link>
                  <RepoStatusBadge status={repo.status} />
                </div>
                <p className="text-xs text-ink-400 mt-1">{formatRelative(repo.createdAt)}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  {repo.status === "complete" && (
                    <Link to={`/repositories/${repo._id}/analysis`} className="text-ink-600 dark:text-ink-300">Analysis</Link>
                  )}
                  <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer" className="text-ink-600 dark:text-ink-300">GitHub</a>
                  <button onClick={() => setDeleteId(repo._id)} className="text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ImportRepoModal open={importOpen} onClose={() => setImportOpen(false)} />

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete repository">
        <p className="text-sm text-ink-500 mb-5">
          This will delete the repository and all its analysis data. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => { deleteRepo.mutate(deleteId); setDeleteId(null); }} className="btn-danger">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
