"use client"

import { useState, useEffect } from "react"
import { UsersTable } from "@/components/users/users-table"
import type { User } from "@prisma/client"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function UsersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is ADMIN
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [user, router])

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <p className="text-slate-400">Access denied. Only ADMIN can view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage system users and their roles</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading users...</p>
          </div>
        ) : (
          <UsersTable users={users} onRefresh={() => {
            fetch("/api/users")
              .then(res => res.json())
              .then(data => setUsers(data))
              .catch(console.error)
          }} />
        )}
      </div>
    </div>
  )
}

