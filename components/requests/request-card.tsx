"use client"

import { AlertCircle, Zap } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Equipment = {
  id: string
  name: string
  serialNumber: string
}

type MaintenanceRequest = {
  id: string
  subject: string
  scheduledDate?: string | Date | null
  status: string
  priority: string
  maintenanceType: string
}

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
      className={`group relative cursor-pointer rounded-xl bg-slate-800/70 p-4 ring-1 shadow-lg shadow-black/20 transition hover:bg-slate-800/85 hover:ring-slate-600/70 ${
        isOverdue ? "ring-red-500/60" : "ring-slate-700/60"
      }`}
    >
      {isOverdue && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-red-500" />
      )}
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-white flex-1 line-clamp-2">
          {request.subject}
        </h4>
        <span
          className={`${priorityConfig_.color} ${priorityConfig_.text} text-xs px-2 py-1 rounded-md whitespace-nowrap ring-1 ring-black/10`}
        >
          {request.priority}
        </span>
      </div>

      {isOverdue && (
        <div className="mb-2">
          <span className="text-xs text-red-300 font-semibold">OVERDUE</span>
        </div>
      )}

      <p className="text-slate-300/80 text-xs mb-3 line-clamp-2">
        {request.equipment.name}
      </p>

      <div className="flex items-center gap-2 text-xs text-slate-300/80 mb-2">
        <TypeIcon size={14} className="text-slate-300/80" />
        <span>{typeConfig_.label}</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        {request.user && (
          <p className="text-xs text-slate-400">By: {request.user.name}</p>
        )}
        {request.assignedTechnician && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {getInitials(request.assignedTechnician.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-300/80">{request.assignedTechnician.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
