"use client"

import type { Equipment } from "@prisma/client"
import { useState, useEffect } from "react"
import { AlertCircle, Edit2, Trash2, Plus, Wrench } from "lucide-react"
import { EquipmentForm } from "./equipment-form"
import { useRouter } from "next/navigation"

interface EquipmentTableProps {
  equipment: Equipment[]
  companyId: string
  onRefresh: () => void
}

const statusColors: Record<string, string> = {
  OPERATIONAL: "bg-green-900 text-green-200",
  MAINTENANCE_REQUIRED: "bg-yellow-900 text-yellow-200",
  OUT_OF_SERVICE: "bg-red-900 text-red-200",
  CRITICAL: "bg-red-800 text-red-100",
}

const categoryIcons: Record<string, string> = {
  Monitors: "🖥️",
  Computers: "💻",
  Printers: "🖨️",
  Scanners: "📱",
  Other: "⚙️",
}

export function EquipmentTable({ equipment, companyId, onRefresh }: EquipmentTableProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({})

  // Fetch request counts for each equipment
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`/api/requests?companyId=${companyId}`)
        if (response.ok) {
          const requests = await response.json()
          const counts: Record<string, number> = {}
          requests.forEach((req: any) => {
            if (req.status !== 'REPAIRED' && req.status !== 'SCRAP' && req.status !== 'CANCELLED') {
              counts[req.equipmentId] = (counts[req.equipmentId] || 0) + 1
            }
          })
          setRequestCounts(counts)
        }
      } catch (error) {
        console.error("Fetch request counts error:", error)
      }
    }
    fetchCounts()
  }, [companyId])

  const handleEdit = (item: Equipment) => {
    setSelectedEquipment(item)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedEquipment(null)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Equipment</h2>
        <button
          onClick={() => {
            setSelectedEquipment(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Equipment
        </button>
      </div>

      {showForm && <EquipmentForm equipment={selectedEquipment} companyId={companyId} onClose={handleFormClose} />}

      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Equipment</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Serial Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Assigned To</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Department</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Health</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-slate-700 transition">
                <td className="px-6 py-4 text-white font-medium">
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[item.category] || "⚙️"}</span>
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 text-sm">{item.serialNumber}</td>
                <td className="px-6 py-4 text-slate-300">{item.assignedTo || "-"}</td>
                <td className="px-6 py-4 text-slate-300">{item.department || "-"}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.health >= 70 ? "bg-green-500" : item.health >= 40 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.health}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300">{item.health}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status] || statusColors.OPERATIONAL}`}
                  >
                    {item.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <button
                      onClick={() => {
                        router.push(`/requests?equipmentId=${item.id}`)
                      }}
                      className="relative px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 text-sm font-medium"
                      title="View Maintenance Requests"
                    >
                      <Wrench size={16} />
                      Maintenance
                      {requestCounts[item.id] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {requestCounts[item.id]}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLoading === item.id}
                      className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {equipment.length === 0 && (
        <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400">No equipment found. Create your first equipment.</p>
          </div>
        </div>
      )}
    </div>
  )
}
