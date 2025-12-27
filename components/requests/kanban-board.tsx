"use client"

import type { MaintenanceRequest, Equipment, Team } from "@prisma/client"
import { useEffect, useState } from "react"
import { ArrowRight, AlertTriangle, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { RequestCard } from "./request-card"
import { RequestForm } from "./request-form"
import { useAuth } from "@/lib/auth-context"

interface RequestWithRelations extends MaintenanceRequest {
  equipment: Equipment
  team: Team | null
  user: any
  assignedTechnician?: any
}

interface KanbanBoardProps {
  requests: RequestWithRelations[]
  companyId: string
  onRefresh: () => void
}

const statuses = ["NEW", "IN_PROGRESS", "REPAIRED", "SCRAP", "CANCELLED"]

const statusConfig = {
  NEW: { label: "New Requests", icon: AlertCircle, color: "bg-blue-900", textColor: "text-blue-200" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "bg-yellow-900", textColor: "text-yellow-200" },
  REPAIRED: { label: "Repaired", icon: CheckCircle, color: "bg-green-900", textColor: "text-green-200" },
  SCRAP: { label: "Scrap", icon: AlertTriangle, color: "bg-red-900", textColor: "text-red-200" },
  CANCELLED: { label: "Cancelled", icon: AlertTriangle, color: "bg-gray-900", textColor: "text-gray-200" },
}

export function KanbanBoard({ requests, companyId, onRefresh }: KanbanBoardProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null)
  const [dragging, setDragging] = useState<{ id: string; status: string } | null>(null)
  const [moving, setMoving] = useState(false)
  const [localRequests, setLocalRequests] = useState<RequestWithRelations[]>(requests)
  const [showDetails, setShowDetails] = useState(false)

  // Keep local requests in sync when props change (e.g., after refresh)
  useEffect(() => {
    setLocalRequests(requests)
  }, [requests])
  
  // Role-based permissions
  const canCreateRequest = ["ADMIN", "MANAGER", "EMPLOYEE"].includes(user?.role || "")
  const canUpdateStatus = ["TECHNICIAN"].includes(user?.role || "")

  const handleMoveRequest = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        onRefresh()
        return true
      }
      return false
    } catch (error) {
      console.error("Move error:", error)
      return false
    }
  }

  // Determine if a drag from one status to another is allowed (technician workflow)
  const isTransitionAllowed = (from: string, to: string) => {
    if (from === to) return false
    // Forward-only transitions + allow scrap from IN_PROGRESS
    if (from === "NEW" && to === "IN_PROGRESS") return true
    if (from === "IN_PROGRESS" && to === "REPAIRED") return true
    if (from === "IN_PROGRESS" && to === "SCRAP") return true
    return false
  }

  const requestsByStatus = statuses.reduce(
    (acc, status) => {
      acc[status] = localRequests.filter((r) => r.status === status)
      return acc
    },
    {} as Record<string, RequestWithRelations[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Maintenance Requests</h2>
        {canCreateRequest && (
          <button
            onClick={() => {
              setSelectedRequest(null)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            New Request
          </button>
        )}
      </div>

      {showForm && (
        <RequestForm
          request={selectedRequest}
          companyId={companyId}
          onClose={() => setShowForm(false)}
          onSuccess={onRefresh}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statuses.map((status) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          const Icon = config.icon
          const cards = requestsByStatus[status]

          return (
            <div key={status} className="flex flex-col h-full">
              <div className={`${config.color} rounded-t-lg px-4 py-3 flex items-center gap-2`}>
                <Icon size={20} className={config.textColor} />
                <h3 className={`font-semibold ${config.textColor}`}>{config.label}</h3>
                <span className={`ml-auto font-bold ${config.textColor}`}>{cards.length}</span>
              </div>

              <div
                className={`flex-1 bg-slate-750 rounded-b-lg p-4 space-y-3 min-h-96 overflow-y-auto ${
                  dragging && isTransitionAllowed(dragging.status, status) ? "ring-2 ring-blue-500" : ""
                }`}
                onDragOver={(e) => {
                  if (!canUpdateStatus) return
                  // Always prevent default for tech so drop can fire; validate onDrop
                  e.preventDefault()
                  if (dragging) {
                    try {
                      e.dataTransfer.dropEffect = isTransitionAllowed(dragging.status, status) ? "move" : "none"
                    } catch {}
                  }
                }}
                onDrop={async (e) => {
                  if (!canUpdateStatus || !dragging || moving) return
                  if (!isTransitionAllowed(dragging.status, status)) return
                  setMoving(true)
                  const prev = localRequests
                  // Optimistic update
                  setLocalRequests((curr) =>
                    curr.map((r) => (r.id === dragging.id ? { ...r, status: status as any } : r)),
                  )
                  try {
                    const ok = await handleMoveRequest(dragging.id, status)
                    if (!ok) {
                      // Revert on failure
                      setLocalRequests(prev)
                    }
                  } finally {
                    setDragging(null)
                    setMoving(false)
                  }
                }}
              >
                {cards.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-slate-500">
                    <p className="text-sm text-center">No requests</p>
                  </div>
                ) : (
                  cards.map((request) => (
                    <div key={request.id} className="space-y-2">
                      <div
                        draggable={
                          canUpdateStatus && status !== "REPAIRED" && status !== "SCRAP" && status !== "CANCELLED"
                        }
                        onDragStart={(e) => {
                          if (!canUpdateStatus || moving) return
                          try {
                            e.dataTransfer.effectAllowed = "move"
                            e.dataTransfer.setData("text/plain", request.id)
                          } catch {}
                          setDragging({ id: request.id, status })
                        }}
                        onDragEnd={() => setDragging(null)}
                      >
                        <RequestCard
                          request={request}
                          onEdit={() => {
                            setSelectedRequest(request)
                            setShowDetails(true)
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetails(false)} />
          <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Request Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                Back
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Subject</p>
                <p className="text-white font-medium">{selectedRequest.subject}</p>
              </div>
              {selectedRequest.description && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Description</p>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400">Equipment</p>
                  <p className="text-white font-medium">{selectedRequest.equipment?.name}</p>
                </div>
                <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400">Priority</p>
                  <p className="text-white font-medium">{selectedRequest.priority}</p>
                </div>
                <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400">Maintenance Type</p>
                  <p className="text-white font-medium">{selectedRequest.maintenanceType}</p>
                </div>
                <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-white font-medium">{selectedRequest.status}</p>
                </div>
                {selectedRequest.team && (
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Team</p>
                    <p className="text-white font-medium">{selectedRequest.team.name}</p>
                  </div>
                )}
                {selectedRequest.assignedTechnician && (
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Assigned Technician</p>
                    <p className="text-white font-medium">{selectedRequest.assignedTechnician.name}</p>
                  </div>
                )}
                {selectedRequest.scheduledDate && (
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Scheduled Date</p>
                    <p className="text-white font-medium">{new Date(selectedRequest.scheduledDate).toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                  <p className="text-xs text-slate-400">Requested By</p>
                  <p className="text-white font-medium">{selectedRequest.user?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
