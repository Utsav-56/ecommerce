'use client'
import { useEffect, useState } from "react"
import { getAllUsersAction, toggleUserRoleAction } from "@/lib/actions/auth"
import { toast } from "react-hot-toast"
import Loading from "@/components/Loading"
import { UserCheckIcon, ShieldAlertIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await getAllUsersAction()
      if (res.success) {
        setUsers(res.users)
      } else {
        toast.error(res.error || "Failed to load users.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRole = async (userId) => {
    setUpdatingUserId(userId)
    try {
      const res = await toggleUserRoleAction(userId)
      if (res.success) {
        toast.success(`User role updated to ${res.user.role}!`)
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u))
        )
      } else {
        toast.error(res.error || "Failed to update role.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="text-muted-foreground mb-28">
      <h1 className="text-2xl text-foreground font-medium">User Management</h1>
      <p className="mt-2 text-sm text-muted-foreground">View registered users and toggle admin access privileges.</p>

      <div className="mt-8 border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-background text-muted-foreground font-medium">
                <th className="p-4 px-6">Name</th>
                <th className="p-4 px-6">Email</th>
                <th className="p-4 px-6">Role</th>
                <th className="p-4 px-6 font-normal text-muted-foreground">Joined Date</th>
                <th className="p-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-background transition">
                    <td className="p-4 px-6 font-medium text-foreground flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 px-6 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="p-4 px-6">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150">
                          <ShieldCheckIcon size={12} />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                          <UserIcon size={12} />
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="p-4 px-6 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleRole(user.id)}
                        disabled={updatingUserId === user.id || user.email === 'admin@gocart.com'}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          user.role === "ADMIN"
                            ? "border-rose-200 text-destructive bg-rose-50 hover:bg-rose-100 disabled:opacity-40"
                            : "border-indigo-200 text-primary bg-indigo-50 hover:bg-indigo-100"
                        } disabled:cursor-not-allowed`}
                      >
                        {updatingUserId === user.id ? (
                          "Updating..."
                        ) : user.role === "ADMIN" ? (
                          <>
                            <ShieldAlertIcon size={13} />
                            Demote to User
                          </>
                        ) : (
                          <>
                            <UserCheckIcon size={13} />
                            Promote to Admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
