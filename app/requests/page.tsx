"use client"

import { useState, useEffect } from "react"
import { KanbanBoard } from "@/components/requests/kanban-board"
import type { MaintenanceRequest, Equipment, Team } from "@prisma/client"

interface RequestWithRelations extends MaintenanceRequest {
  equipment: Equipment
  team: Team | null
  user: any
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId] = useState("default-company")

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?companyId=${companyId}`)
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
    fetchRequests()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Requests</h1>
          <p className="text-slate-400">Track maintenance requests through the workflow</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading requests...</p>
          </div>
        ) : (
          <KanbanBoard requests={requests} companyId={companyId} onRefresh={fetchRequests} />
        )}
      </div>
    </div>
  )
}
