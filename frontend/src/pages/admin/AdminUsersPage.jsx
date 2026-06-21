import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, UserX, ChevronLeft, ChevronRight, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [delId,  setDelId]  = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page, search],
    queryFn:  () => adminApi.listUsers({ page, limit: 15, search }),
    select:   (d) => d.data,
    keepPreviousData: true,
  });

  const updateUser = useMutation({
    mutationFn: ({ id, body }) => adminApi.updateUser(id, body),
    onSuccess: () => { qc.invalidateQueries(["admin","users"]); toast.success("User updated"); setEditId(null); },
    onError:   (e) => toast.error(e.response?.data?.message || "Update failed"),
  });

  const deleteUser = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => { qc.invalidateQueries(["admin","users"]); toast.success("User deleted"); setDelId(null); },
    onError:   (e) => toast.error(e.response?.data?.message || "Delete failed"),
  });

  const users = data?.users  || [];
  const total = data?.total  || 0;
  const pages = data?.pages  || 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-muted mt-0.5">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search users…" className="input pl-10" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["User","Email","Role","Status","Joined","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[160px]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", u.role === "admin" ? "badge-purple" : "badge-gray")}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", u.isActive ? "badge-green" : "badge-red")}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditId(u._id); setEditForm({ role: u.role, isActive: u.isActive }); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDelId(u._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                          title="Delete"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {pages} · {total} users
          </p>
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

      {/* Edit modal */}
      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit User">
        <div className="space-y-4">
          <div>
            <label className="label">Role</label>
            <select value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} className="input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Account active</p>
              <p className="text-xs text-gray-500">Disabled users cannot log in</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))} />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-brand-600 rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={() => setEditId(null)} className="btn-secondary">Cancel</button>
            <button onClick={() => updateUser.mutate({ id: editId, body: editForm })}
              disabled={updateUser.isPending} className="btn-primary">
              {updateUser.isPending ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!delId} onClose={() => setDelId(null)} title="Delete User">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Permanently delete this user and all their data? This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDelId(null)} className="btn-secondary">Cancel</button>
          <button onClick={() => deleteUser.mutate(delId)} disabled={deleteUser.isPending} className="btn-danger">
            {deleteUser.isPending ? <Spinner size="sm" /> : null} Delete
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
