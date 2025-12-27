"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TeamsTable } from "@/components/teams/teams-table"
import type { Team, TeamMember, User } from "@prisma/client"
import { useAuth } from "@/lib/auth-context"
import { Building2 } from "lucide-react"

interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[]
}

export default function TeamsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [teams, setTeams] = useState<TeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only ADMIN and MANAGER can access teams
    if (user && !["ADMIN", "MANAGER"].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, router])

  const fetchTeams = async () => {
    if (!user?.companyId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/teams?companyId=${user.companyId}`)
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
    if (user?.companyId) {
      fetchTeams()
    } else if (user && !user.companyId) {
      setLoading(false)
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Teams</h1>
          <p className="text-slate-400">Organize and manage maintenance teams</p>
          {user.companyName && (
            <p className="text-slate-500 text-sm mt-2">Company: {user.companyName}</p>
          )}
        </div>

        {!user.companyId ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading teams...</p>
          </div>
        ) : (
          <TeamsTable teams={teams} companyId={user.companyId} onRefresh={fetchTeams} />
        )}
      </div>
    </div>
  )
}
