"use client"

import type React from "react"

import type { WorkCenter, WorkCenterAssignment, Equipment } from "@prisma/client"
import { useState } from "react"
import { X } from "lucide-react"

interface WorkCenterWithAssignments extends WorkCenter {
  assignments: (WorkCenterAssignment & { equipment: Equipment })[]
}

interface WorkCenterFormProps {
  workCenter: WorkCenterWithAssignments | null
  companyId: string
  onClose: () => void
}

export function WorkCenterForm({ workCenter, companyId, onClose }: WorkCenterFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: workCenter?.name || "",
    code: workCenter?.code || "",
    location: workCenter?.location || "",
    costPerHour: workCenter?.costPerHour || 0,
    capabilityTimeEfficiency: workCenter?.capabilityTimeEfficiency || 100,
    oeTargetPercentage: workCenter?.oeTargetPercentage || 85,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const url = workCenter ? `/api/work-centers/${workCenter.id}` : "/api/work-centers"
      const method = workCenter ? "PATCH" : "POST"

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
        throw new Error(errorData.error || "Failed to save work center")
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
      <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{workCenter ? "Edit Work Center" : "Add Work Center"}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Work Center Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g., Assembly 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g., ASS-001"
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
              placeholder="Building, Floor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cost per Hour ($)</label>
            <input
              type="number"
              name="costPerHour"
              value={formData.costPerHour}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">OEE Target (%)</label>
            <input
              type="number"
              name="oeTargetPercentage"
              value={formData.oeTargetPercentage}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
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
