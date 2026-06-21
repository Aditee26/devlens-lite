import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, GitBranch, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { adminApi } from "../../api/admin.api";
import Spinner from "../../components/ui/Spinner";
import RepoStatusBadge from "../../components/features/RepoStatusBadge";
import { formatRelative } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function AdminReposPage() {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "repos", page, search],
    queryFn:  () => adminApi.listRepos({ page, limit: 15 }),
    select:   (d) => d.data,
    keepPreviousData: true,
  });

  const repos = data?.repositories || [];
  const total = data?.total  || 0;
  const pages = data?.pages  || 1;

  const filtered = search
    ? repos.filter((r) => r.fullName?.toLowerCase().includes(search.toLowerCase()))
    : repos;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="page-title">All Repositories</h1>
        <p className="text-muted mt-0.5">{total} total repositories across all users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter repositories…" className="input pl-10" />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Repository","Owner (User)","Status","Added","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No repositories found</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-600/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <GitBranch className="w-3.5 h-3.5 text-brand-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{r.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {r.userId ? (
                          <div>
                            <p className="text-gray-900 dark:text-white text-xs font-medium">{r.userId.name}</p>
                            <p className="text-gray-500 text-xs">{r.userId.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><RepoStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatRelative(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <a href={r.githubUrl} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500 inline-flex">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-2.5">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-2.5">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
