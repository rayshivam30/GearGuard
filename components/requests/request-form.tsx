"use client"

import type React from "react"

import type { MaintenanceRequest, Equipment } from "@prisma/client"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface RequestFormProps {
  request: MaintenanceRequest | null
  companyId: string
  onClose: () => void
  onSuccess: () => void
}

export function RequestForm({ request, companyId, onClose, onSuccess }: RequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formData, setFormData] = useState({
    subject: request?.subject || "",
    description: request?.description || "",
    equipmentId: request?.equipmentId || "",
    maintenanceType: request?.maintenanceType || "CORRECTIVE",
    priority: request?.priority || "MEDIUM",
    assignedTeam: (request as any)?.assignedTeam || "",
    assignedTechnicianId: (request as any)?.assignedTechnicianId || "",
    scheduledDate: request?.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : "",
    duration: request?.duration ? Math.round((request.duration || 0) / 60) : "", // Convert minutes to hours
    notes: request?.notes || "",
    instructions: request?.instructions || "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentRes, techniciansRes] = await Promise.all([
          fetch(`/api/equipment?companyId=${companyId}`),
          fetch(`/api/users?companyId=${companyId}&role=TECHNICIAN`)
        ])
        
        if (equipmentRes.ok) {
          const data = await equipmentRes.json()
          setEquipment(data)
        }
        
        if (techniciansRes.ok) {
          const techData = await techniciansRes.json()
          setTechnicians(techData)
        }
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }

    fetchData()
  }, [companyId])

  // Auto-fill logic when equipment is selected
  const handleEquipmentChange = async (equipmentId: string) => {
    // Update form data immediately
    setFormData((prev) => ({
      ...prev,
      equipmentId,
    }))

    if (!equipmentId) return

    // Try to fetch full equipment details for auto-fill
    try {
      const response = await fetch(`/api/equipment/${equipmentId}`)
      if (response.ok) {
        const equipmentData = await response.json()
        
        // Auto-fill assigned team from equipment's default maintenance team
        setFormData((prev) => ({
          ...prev,
          assignedTeam: equipmentData.defaultMaintenanceTeamId || prev.assignedTeam,
        }))
      }
    } catch (error) {
      console.error("Fetch equipment details error:", error)
      // Continue even if fetch fails - equipment is already selected
    }
  }

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
      const url = request ? `/api/requests/${request.id}` : "/api/requests"
      const method = request ? "PATCH" : "POST"

      const payload: any = {
        ...formData,
        companyId,
      }
      
      // Convert duration from hours to minutes
      if (payload.duration) {
        payload.duration = Math.round(parseFloat(payload.duration) * 60)
      } else {
        delete payload.duration
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save request")
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl max-w-2xl w-full mx-4 p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{request ? "Edit Request" : "New Maintenance Request"}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Request subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Equipment</label>
            <select
              name="equipmentId"
              value={formData.equipmentId}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">Select equipment</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} - {eq.serialNumber}
                </option>
              ))}
            </select>
            {formData.equipmentId && (
              <p className="text-xs text-slate-400 mt-1">
                Equipment category and maintenance team will be auto-filled
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Maintenance Type</label>
              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option value="CORRECTIVE">Corrective</option>
                <option value="PREVENTIVE">Preventive</option>
                <option value="PREDICTIVE">Predictive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Scheduled Date (for Preventive maintenance)</label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Detailed description"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Maintenance instructions"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Assign Technician</label>
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

          {request && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (Hours Spent)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="Hours spent on maintenance"
              />
            </div>
          )}

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
