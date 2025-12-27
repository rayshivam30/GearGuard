"use client"

import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  bgColor: string
  textColor: string
}

export function StatCard({ title, value, subtitle, icon, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-slate-700`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`${textColor} opacity-20`}>{icon}</div>
      </div>
    </div>
  )
}
