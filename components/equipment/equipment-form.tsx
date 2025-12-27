"use client"

import type React from "react"

import type { Equipment, Team, User } from "@prisma/client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface EquipmentFormProps {
  equipment: Equipment | null
  companyId: string
  onClose: () => void
}

const categories = ["Monitors", "Computers", "Printers", "Scanners", "Other"]

export function EquipmentForm({ equipment, companyId, onClose }: EquipmentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [technicians, setTechnicians] = useState<User[]>([])
  const [formData, setFormData] = useState({
    name: equipment?.name || "",
    serialNumber: equipment?.serialNumber || "",
    category: equipment?.category || "Computers",
    department: equipment?.department || "",
    assignedTo: equipment?.assignedTo || "",
    location: (equipment as any)?.location || "",
    purchaseDate: (equipment as any)?.purchaseDate ? new Date((equipment as any).purchaseDate).toISOString().split('T')[0] : "",
    warrantyInfo: (equipment as any)?.warrantyInfo || "",
    assignedTechnicianId: (equipment as any)?.assignedTechnicianId || "",
    defaultMaintenanceTeamId: (equipment as any)?.defaultMaintenanceTeamId || "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, usersRes] = await Promise.all([
          fetch(`/api/teams?companyId=${companyId}`),
          fetch(`/api/users?companyId=${companyId}`)
        ])
        
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json()
          setTeams(teamsData)
        }
        
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setTechnicians(usersData.filter((u: User) => u.role === 'TECHNICIAN' || u.role === 'MANAGER'))
        }
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }
    
    fetchData()
  }, [companyId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = equipment ? `/api/equipment/${equipment.id}` : "/api/equipment"
      const method = equipment ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save equipment")
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{equipment ? "Edit Equipment" : "Add Equipment"}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Equipment Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g., Samsung Monitor 15&quot;"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Serial Number</label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g., MT/125/227F3837"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g., Admin, Technician"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assigned To (Employee)</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Employee name or email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Physical location (e.g., Building A, Floor 2)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Warranty Information</label>
            <textarea
              name="warrantyInfo"
              value={formData.warrantyInfo}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Warranty details, expiry date, etc."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Default Assigned Technician</label>
            <select
              name="assignedTechnicianId"
              value={formData.assignedTechnicianId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">Select technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Default Maintenance Team</label>
            <select
              name="defaultMaintenanceTeamId"
              value={formData.defaultMaintenanceTeamId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-medium"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
