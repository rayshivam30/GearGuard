"use client"

import { useState, useEffect } from "react"
import { WorkCenterTable } from "@/components/work-centers/work-center-table"
import type { WorkCenter, WorkCenterAssignment, Equipment } from "@prisma/client"

interface WorkCenterWithAssignments extends WorkCenter {
  assignments: (WorkCenterAssignment & { equipment: Equipment })[]
}

export default function WorkCentersPage() {
  const [workCenters, setWorkCenters] = useState<WorkCenterWithAssignments[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId] = useState("default-company")

  const fetchWorkCenters = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/work-centers?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setWorkCenters(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkCenters()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Work Centers</h1>
          <p className="text-slate-400">Manage production work centers and their assignments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading work centers...</p>
          </div>
        ) : (
          <WorkCenterTable workCenters={workCenters} companyId={companyId} onRefresh={fetchWorkCenters} />
        )}
      </div>
    </div>
  )
}
