"use client"

import type { Equipment } from "@prisma/client"
import { AlertTriangle } from "lucide-react"

interface CriticalEquipmentAlertProps {
  equipment: Equipment[]
}

export function CriticalEquipmentAlert({ equipment }: CriticalEquipmentAlertProps) {
  const criticalItems = equipment.filter((e) => e.status === "CRITICAL" || e.health < 30)

  if (criticalItems.length === 0) {
    return null
  }

  return (
    <div className="bg-red-900 border border-red-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-red-200" size={24} />
        <h3 className="text-lg font-bold text-red-200">Critical Equipment Alert</h3>
      </div>

      <div className="space-y-2">
        {criticalItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-red-800 rounded-lg">
            <div>
              <p className="text-red-100 font-medium">{item.name}</p>
              <p className="text-red-300 text-sm">{item.serialNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-red-100 font-bold">{item.health}% health</p>
              <p className="text-red-300 text-xs">{item.status.replace(/_/g, " ")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
