"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import type { Equipment, Company } from "@prisma/client"
import { Building2 } from "lucide-react"

export default function EquipmentPage() {
  const router = useRouter()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>("")

  const fetchEquipment = async () => {
    if (!companyId) return
    
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
      fetchEquipment()
    }
  }, [companyId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Equipment Management</h1>
          <p className="text-slate-400">Track and manage all company equipment</p>
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
                <p className="text-slate-400">Loading equipment...</p>
              </div>
            ) : (
              <EquipmentTable equipment={equipment} companyId={companyId} onRefresh={fetchEquipment} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
