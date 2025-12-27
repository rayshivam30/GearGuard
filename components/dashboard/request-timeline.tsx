"use client"

import type { MaintenanceRequest, Equipment } from "@prisma/client"
import { format } from "date-fns"

interface RequestTimelineProps {
  requests: (MaintenanceRequest & { equipment: Equipment })[]
}

export function RequestTimeline({ requests }: RequestTimelineProps) {
  const recentRequests = requests.slice(0, 5)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-6">Recent Requests</h3>

      <div className="space-y-4">
        {recentRequests.length === 0 ? (
          <p className="text-slate-400 text-sm">No recent requests</p>
        ) : (
          recentRequests.map((request) => (
            <div key={request.id} className="flex gap-4 pb-4 border-b border-slate-700 last:border-b-0">
              <div className="w-1 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{request.subject}</p>
                <p className="text-slate-400 text-xs">{request.equipment.name}</p>
                <p className="text-slate-500 text-xs mt-1">{format(new Date(request.createdAt), "MMM dd, HH:mm")}</p>
              </div>
              <div>
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  {request.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
