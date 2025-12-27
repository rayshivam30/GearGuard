"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type MaintenanceTypeValue = "CORRECTIVE" | "PREVENTIVE" | "PREDICTIVE"

function formatDateForDateInput(value: Date | string | null | undefined) {
  if (!value) return ""
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

type MaintenanceRequest = {
  id: string
  subject: string
  description: string | null
  equipmentId: string
  maintenanceType: MaintenanceTypeValue
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  assignedTeam: string | null
  assignedTechnicianId: string | null
  scheduledDate: Date | string | null
  duration: number | null
  notes: string | null
  instructions: string | null
}

type Equipment = {
  id: string
  name: string
  serialNumber: string
}

interface RequestFormProps {
  request: MaintenanceRequest | null
  companyId: string
  defaultScheduledDate?: Date
  defaultMaintenanceType?: MaintenanceTypeValue
  onClose: () => void
  onSuccess: () => void
}

export function RequestForm({
  request,
  companyId,
  defaultScheduledDate,
  defaultMaintenanceType,
  onClose,
  onSuccess,
}: RequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [formData, setFormData] = useState({
    subject: request?.subject || "",
    description: request?.description || "",
    equipmentId: request?.equipmentId || "",
    maintenanceType: request?.maintenanceType || defaultMaintenanceType || "CORRECTIVE",
    priority: request?.priority || "MEDIUM",
    assignedTeam: (request as any)?.assignedTeam || "",
    assignedTechnicianId: (request as any)?.assignedTechnicianId || "",
    scheduledDate: request?.scheduledDate
      ? formatDateForDateInput(request.scheduledDate)
      : formatDateForDateInput(defaultScheduledDate),
    duration: request?.duration ? Math.round((request.duration || 0) / 60) : "", // Convert minutes to hours
    notes: request?.notes || "",
    instructions: request?.instructions || "",
  })

  useEffect(() => {
    if (request) return
    if (!defaultScheduledDate && !defaultMaintenanceType) return

    setFormData((prev) => ({
      ...prev,
      ...(defaultMaintenanceType ? { maintenanceType: defaultMaintenanceType } : {}),
      ...(defaultScheduledDate ? { scheduledDate: formatDateForDateInput(defaultScheduledDate) } : {}),
    }))
  }, [request, defaultScheduledDate, defaultMaintenanceType])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentRes, techniciansRes] = await Promise.all([
          fetch(`/api/equipment?companyId=${companyId}`),
          fetch(`/api/users?companyId=${companyId}&role=TECHNICIAN`),
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
        let message = "Failed to save request"
        try {
          const errorData = await response.json()
          message = errorData?.error || message
        } catch {
          try {
            const text = await response.text()
            if (text) message = text
          } catch {
            // ignore
          }
        }
        throw new Error(message)
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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-800/80 ring-1 ring-slate-700/70 shadow-2xl shadow-black/40">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/40 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{request ? "Edit Request" : "New Maintenance Request"}</h2>
              <p className="text-xs text-slate-400">Fill details and save to update the workflow</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto px-6 py-5">

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="w-full rounded-lg bg-black/20 px-3 py-2 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="w-full rounded-lg bg-black/20 px-3 py-2 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
              className="w-full rounded-lg bg-black/20 px-3 py-2 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                className="w-full rounded-lg bg-black/20 px-3 py-2 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Hours spent on maintenance"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-400/20">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500 disabled:bg-blue-400"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  )
}
