"use client"

import type { Equipment, Company } from "@prisma/client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { EquipmentForm } from "./equipment-form"
import { useAuth } from "@/lib/auth-context"

type EquipmentWithCompany = Equipment & {
  company: Company
}

interface EquipmentTableProps {
  equipment: EquipmentWithCompany[]
  companyId: string
  onRefresh: () => void
}

export function EquipmentTable({ equipment, companyId, onRefresh }: EquipmentTableProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  
  // Role-based permissions
  const canCreate = ["ADMIN", "MANAGER"].includes(user?.role || "")

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedEquipment(null)
    onRefresh()
  }

  return (
    <div className="relative">
      {showForm && <EquipmentForm equipment={selectedEquipment} companyId={companyId} onClose={handleFormClose} />}

      <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Header with New button and Equipment title */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-700/50">
          {canCreate && (
            <button
              onClick={() => {
                setSelectedEquipment(null)
                setShowForm(true)
              }}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-md border border-slate-600 transition"
            >
              New
            </button>
          )}
          <h2 className="text-lg font-medium text-slate-200">Equipment</h2>
          
          {/* Remarkable Squirrel badge - decorative element */}
          <div className="ml-auto">
            <div className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 text-xs font-medium">
              Remarkable Squirrel
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Equipment Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Equipment Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition cursor-pointer ${
                    index === 0 ? 'bg-slate-800/20' : ''
                  }`}
                  onClick={() => {
                    setSelectedEquipment(item)
                    setShowForm(true)
                  }}
                >
                  <td className="px-6 py-4 text-sm text-slate-200">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.assignedTo || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.department || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{item.serialNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.technician || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {item.company.name} {item.company.location ? `(${item.company.location})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {equipment.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-500 text-sm">No equipment found</p>
          </div>
        )}
      </div>
    </div>
  )
}
