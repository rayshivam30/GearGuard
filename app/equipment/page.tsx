"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import type { Equipment, Company } from "@prisma/client"
import { Building2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function EquipmentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEquipment = async () => {
    if (!user?.companyId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/equipment?companyId=${user.companyId}`)
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
    if (user?.companyId) {
      fetchEquipment()
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
          <h1 className="text-4xl font-bold text-white mb-2">Equipment Management</h1>
          <p className="text-slate-400">Track and manage all company equipment</p>
          {user.companyName && (
            <p className="text-slate-500 text-sm mt-2">Company: {user.companyName}</p>
          )}
        </div>

        {!user.companyId ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
            <button
              onClick={() => router.push("/companies")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Manage Companies
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading equipment...</p>
          </div>
        ) : (
          <EquipmentTable equipment={equipment} companyId={user.companyId} onRefresh={fetchEquipment} />
        )}
      </div>
    </div>
  )
}
