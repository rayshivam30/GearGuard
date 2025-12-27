"use client"

import type { MaintenanceRequest, Equipment } from "@prisma/client"
import { AlertCircle, Zap } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RequestCardProps {
  request: MaintenanceRequest & { equipment: Equipment; user: any; assignedTechnician?: any }
  onEdit: () => void
}

const priorityConfig = {
  LOW: { color: "bg-green-900", text: "text-green-200" },
  MEDIUM: { color: "bg-yellow-900", text: "text-yellow-200" },
  HIGH: { color: "bg-orange-900", text: "text-orange-200" },
  CRITICAL: { color: "bg-red-900", text: "text-red-200" },
}

const typeConfig = {
  CORRECTIVE: { icon: AlertCircle, label: "Corrective" },
  PREVENTIVE: { icon: Zap, label: "Preventive" },
  PREDICTIVE: { icon: Zap, label: "Predictive" },
}

export function RequestCard({ request, onEdit }: RequestCardProps) {
  const priorityConfig_ = priorityConfig[request.priority as keyof typeof priorityConfig]
  const typeConfig_ = typeConfig[request.maintenanceType as keyof typeof typeConfig]
  const TypeIcon = typeConfig_.icon

  // Check if overdue
  const isOverdue = request.scheduledDate && 
    new Date(request.scheduledDate) < new Date() && 
    request.status !== "REPAIRED" && 
    request.status !== "SCRAP" &&
    request.status !== "CANCELLED"

  // Get technician initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div
      onClick={onEdit}
      className={`bg-slate-800 border rounded-lg p-4 cursor-pointer hover:border-slate-600 transition relative ${
        isOverdue ? "border-red-500 border-l-4" : "border-slate-700"
      }`}
    >
      {isOverdue && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-t-lg" />
      )}
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-white text-sm flex-1 line-clamp-2">{request.subject}</h4>
        <span
          className={`${priorityConfig_.color} ${priorityConfig_.text} text-xs px-2 py-1 rounded whitespace-nowrap`}
        >
          {request.priority}
        </span>
      </div>

      {isOverdue && (
        <div className="mb-2">
          <span className="text-xs text-red-400 font-medium">⚠️ OVERDUE</span>
        </div>
      )}

      <p className="text-slate-400 text-xs mb-3 line-clamp-2">{request.equipment.name}</p>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <TypeIcon size={14} />
        <span>{typeConfig_.label}</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        {request.user && (
          <p className="text-xs text-slate-500">By: {request.user.name}</p>
        )}
        {request.assignedTechnician && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {getInitials(request.assignedTechnician.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-400">{request.assignedTechnician.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
