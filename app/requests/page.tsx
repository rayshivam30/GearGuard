"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { KanbanBoard } from "@/components/requests/kanban-board"
import type { MaintenanceRequest, Equipment, Team, Company } from "@prisma/client"
import { Building2 } from "lucide-react"

interface RequestWithRelations extends MaintenanceRequest {
  equipment: Equipment
  team: Team | null
  user: any
}

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>("")

  const fetchRequests = async () => {
    if (!companyId) return
    
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

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        if (data.length > 0 && !companyId) {
          setCompanyId(data[0].id)
        }
      }
    } catch (error) {
      console.error("Fetch companies error:", error)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (companyId) {
      fetchRequests()
    }
  }, [companyId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Requests</h1>
          <p className="text-slate-400">Track maintenance requests through the workflow</p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">No companies found. Please add a company first.</p>
            <button
              onClick={() => router.push("/companies")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Go to Companies
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} {company.location ? `(${company.location})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-slate-400">Loading requests...</p>
              </div>
            ) : (
              <KanbanBoard requests={requests} companyId={companyId} onRefresh={fetchRequests} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
