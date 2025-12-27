"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TeamsTable } from "@/components/teams/teams-table"
import type { Team, TeamMember, User } from "@prisma/client"
import { useAuth } from "@/lib/auth-context"

interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[]
}

export default function TeamsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId] = useState("default-company")

  useEffect(() => {
    // Only ADMIN and MANAGER can access teams
    if (user && !["ADMIN", "MANAGER"].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, router])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teams?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Teams</h1>
          <p className="text-slate-400">Organize and manage maintenance teams</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading teams...</p>
          </div>
        ) : (
          <TeamsTable teams={teams} companyId={companyId} onRefresh={fetchTeams} />
        )}
      </div>
    </div>
  )
}
