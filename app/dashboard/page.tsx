"use client"

import { useState, useEffect } from "react"
import { BarChart3, AlertTriangle, Users, TrendingUp, Zap } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { CriticalEquipmentAlert } from "@/components/dashboard/critical-equipment-alert"
import { RequestTimeline } from "@/components/dashboard/request-timeline"
import type { Equipment, MaintenanceRequest } from "@prisma/client"
import { useAuth } from "@/lib/auth-context"

interface Stats {
  equipment: {
    total: number
    critical: number
    averageHealth: number
  }
  requests: {
    total: number
    new: number
    inProgress: number
    completed: number
    completionRate: number
  }
  teams: {
    total: number
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<(MaintenanceRequest & { equipment: Equipment })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.companyId) {
      if (user && !user.companyId) {
        setLoading(false)
      }
      return
    }
    
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch stats
        const statsRes = await fetch(`/api/dashboard/stats?companyId=${user.companyId}`)
        if (statsRes.ok) {
          setStats(await statsRes.json())
        }

        // Fetch equipment
        const equipmentRes = await fetch(`/api/equipment?companyId=${user.companyId}`)
        if (equipmentRes.ok) {
          setEquipment(await equipmentRes.json())
        }

        // Fetch requests
        const requestsRes = await fetch(`/api/requests?companyId=${user.companyId}`)
        if (requestsRes.ok) {
          setRequests(await requestsRes.json())
        }
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    )
  }

  if (!user?.companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <AlertTriangle className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
          </div>
        </div>
      </div>
    )
  }

  const roleTitle = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">{roleTitle ? `${roleTitle} Dashboard` : "Dashboard"}</h1>
          <p className="text-slate-400">Real-time overview of maintenance operations</p>
          {user.companyName && (
            <p className="text-slate-500 text-sm mt-2">Company: {user.companyName}</p>
          )}
        </div>

        {stats && (
          <>
            {/* Critical Equipment Alert */}
            {equipment.filter((e) => e.status === "CRITICAL" || e.health < 30).length > 0 && (
              <div className="mb-8">
                <CriticalEquipmentAlert equipment={equipment} />
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Equipment"
                value={stats.equipment.total}
                subtitle={`${stats.equipment.critical} critical`}
                icon={<BarChart3 size={40} />}
                bgColor="bg-slate-800"
                textColor="text-blue-400"
              />

              <StatCard
                title="Avg Health"
                value={`${stats.equipment.averageHealth}%`}
                subtitle="Fleet health"
                icon={<Zap size={40} />}
                bgColor="bg-slate-800"
                textColor="text-green-400"
              />

              <StatCard
                title="Total Requests"
                value={stats.requests.total}
                subtitle={`${stats.requests.new} new`}
                icon={<AlertTriangle size={40} />}
                bgColor="bg-slate-800"
                textColor="text-yellow-400"
              />

              <StatCard
                title="In Progress"
                value={stats.requests.inProgress}
                subtitle="Active work"
                icon={<TrendingUp size={40} />}
                bgColor="bg-slate-800"
                textColor="text-orange-400"
              />

              <StatCard
                title="Completion Rate"
                value={`${stats.requests.completionRate}%`}
                subtitle={`${stats.requests.completed} completed`}
                icon={<Users size={40} />}
                bgColor="bg-slate-800"
                textColor="text-purple-400"
              />
            </div>

            {/* Request Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RequestTimeline requests={requests} />
              </div>

              {/* Quick Info */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-6">Quick Stats</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                    <span className="text-slate-300">Teams</span>
                    <span className="text-white font-bold">{stats.teams.total}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                    <span className="text-slate-300">Completed Today</span>
                    <span className="text-green-400 font-bold">
                      {requests.filter((r) => r.status === "REPAIRED").length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                    <span className="text-slate-300">Overdue Maintenance</span>
                    <span className="text-red-400 font-bold">{equipment.filter((e) => e.health < 50).length}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                    <span className="text-slate-300">Critical Issues</span>
                    <span className="text-orange-400 font-bold">
                      {requests.filter((r) => r.priority === "CRITICAL" && r.status !== "REPAIRED").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
