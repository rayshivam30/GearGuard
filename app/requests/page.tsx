"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/requests/kanban-board"
import type { MaintenanceRequest, Equipment, Team } from "@prisma/client"
import { Building2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface RequestWithRelations extends MaintenanceRequest {
  equipment: Equipment
  team: Team | null
  user: any
}

export default function RequestsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    if (!user?.companyId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?companyId=${user.companyId}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.companyId) {
      fetchRequests()
    } else if (user && !user.companyId) {
      setLoading(false)
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Requests</h1>
          <p className="text-slate-400">Track maintenance requests through the workflow</p>
          {user.companyName && (
            <p className="text-slate-500 text-sm mt-2">Company: {user.companyName}</p>
          )}
        </div>

        {!user.companyId ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading requests...</p>
          </div>
        ) : (
          <KanbanBoard requests={requests} companyId={user.companyId} onRefresh={fetchRequests} />
        )}
      </div>
    </div>
  )
}
