"use client"

import type { User } from "@prisma/client"
import { useState } from "react"
import { Edit2, Trash2, Plus, Shield, User as UserIcon, Wrench, Briefcase } from "lucide-react"
import { UserForm } from "./user-form"

interface UsersTableProps {
  users: User[]
  onRefresh: () => void
}

const roleConfig = {
  ADMIN: { color: "bg-purple-900 text-purple-200", icon: Shield, label: "Admin" },
  MANAGER: { color: "bg-blue-900 text-blue-200", icon: Briefcase, label: "Manager" },
  TECHNICIAN: { color: "bg-green-900 text-green-200", icon: Wrench, label: "Technician" },
  EMPLOYEE: { color: "bg-gray-900 text-gray-200", icon: UserIcon, label: "Employee" },
}

export function UsersTable({ users, onRefresh }: UsersTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete user")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedUser(null)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Users</h2>
        <button
          onClick={() => {
            setSelectedUser(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New User
        </button>
      </div>

      {showForm && <UserForm user={selectedUser} onClose={handleFormClose} />}

      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => {
              const roleInfo = roleConfig[user.role as keyof typeof roleConfig]
              const RoleIcon = roleInfo.icon

              return (
                <tr key={user.id} className="hover:bg-slate-700 transition">
                  <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`${roleInfo.color} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                      <RoleIcon size={14} />
                      {roleInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{user.department || "-"}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteLoading === user.id}
                        className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-center">
            <p className="text-slate-400">No users found. Create your first user.</p>
          </div>
        </div>
      )}
    </div>
  )
}

