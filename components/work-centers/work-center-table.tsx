"use client"

import type { WorkCenter, WorkCenterAssignment, Equipment } from "@prisma/client"
import { useState } from "react"
import { AlertCircle, Edit2, Trash2, Plus } from "lucide-react"
import { WorkCenterForm } from "./work-center-form"

interface WorkCenterWithAssignments extends WorkCenter {
  assignments: (WorkCenterAssignment & { equipment: Equipment })[]
}

interface WorkCenterTableProps {
  workCenters: WorkCenterWithAssignments[]
  companyId: string
  onRefresh: () => void
}

export function WorkCenterTable({ workCenters, companyId, onRefresh }: WorkCenterTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WorkCenterWithAssignments | null>(null)
  const [expandedWorkCenter, setExpandedWorkCenter] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const handleEdit = (wc: WorkCenterWithAssignments) => {
    setSelectedWorkCenter(wc)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work center?")) return

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/work-centers/${id}`, {
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
    setSelectedWorkCenter(null)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Work Centers</h2>
        <button
          onClick={() => {
            setSelectedWorkCenter(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Work Center
        </button>
      </div>

      {showForm && <WorkCenterForm workCenter={selectedWorkCenter} companyId={companyId} onClose={handleFormClose} />}

      <div className="grid gap-4">
        {workCenters.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-slate-500" size={40} />
              <p className="text-slate-400">No work centers found. Create your first work center.</p>
            </div>
          </div>
        ) : (
          workCenters.map((wc) => (
            <div key={wc.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-slate-750 transition flex items-center justify-between"
                onClick={() => setExpandedWorkCenter(expandedWorkCenter === wc.id ? null : wc.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-900 text-blue-200 text-sm font-bold rounded">{wc.code}</span>
                    <h3 className="text-lg font-semibold text-white">{wc.name}</h3>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{wc.location || "No location"}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-slate-500 text-sm">${wc.costPerHour}/hr</span>
                    <span className="text-slate-500 text-sm">OEE Target: {wc.oeTargetPercentage}%</span>
                    <span className="text-slate-500 text-sm">{wc.assignments.length} equipment</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(wc)
                    }}
                    className="p-2 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(wc.id)
                    }}
                    disabled={deleteLoading === wc.id}
                    className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedWorkCenter === wc.id && (
                <div className="border-t border-slate-700 p-6 bg-slate-750">
                  <h4 className="font-semibold text-white mb-4">Assigned Equipment</h4>

                  {wc.assignments.length === 0 ? (
                    <p className="text-slate-400 text-sm">No equipment assigned to this work center.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {wc.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                        >
                          <div>
                            <p className="text-white font-medium text-sm">{assignment.equipment.name}</p>
                            <p className="text-slate-400 text-xs">{assignment.equipment.serialNumber}</p>
                          </div>
                          <span className="text-slate-300 text-xs">{assignment.equipment.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
