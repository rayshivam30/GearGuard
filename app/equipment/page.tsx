"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import type { Equipment } from "@prisma/client"

export default function EquipmentPage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId] = useState("default-company")

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/equipment?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Equipment Management</h1>
          <p className="text-slate-400">Track and manage all company equipment</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading equipment...</p>
          </div>
        ) : (
          <EquipmentTable equipment={equipment} companyId={companyId} onRefresh={fetchEquipment} />
        )}
      </div>
    </div>
  )
}
