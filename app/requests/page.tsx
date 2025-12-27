"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/requests/kanban-board"
import { Building2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Equipment = {
  id: string
  name: string
  serialNumber: string
}

type Team = {
  id: string
  name: string
}

type MaintenanceRequest = {
  id: string
  subject: string
  description?: string | null
  status: string
  priority: string
  maintenanceType: string
  scheduledDate?: string | Date | null
  createdAt: string | Date
}

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Maintenance Requests</h1>
          <p className="text-sm text-slate-300">Track maintenance requests through the workflow</p>
          {user.companyName && <p className="text-slate-400 text-sm">Company: {user.companyName}</p>}
        </div>

        {!user.companyId ? (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-10 text-center shadow-xl shadow-black/20">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-xl shadow-black/20">
            <p className="text-slate-300">Loading requests...</p>
          </div>
        ) : (
          <KanbanBoard requests={requests} companyId={user.companyId} onRefresh={fetchRequests} />
        )}
      </div>
    </div>
  )
}
