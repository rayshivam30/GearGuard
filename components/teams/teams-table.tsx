"use client"

import type { Team, TeamMember, User } from "@prisma/client"
import { useState } from "react"
import { AlertCircle, Edit2, Trash2, Plus, UserX } from "lucide-react"
import { TeamForm } from "./team-form"

interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[]
}

interface TeamsTableProps {
  teams: TeamWithMembers[]
  companyId: string
  onRefresh: () => void
}

export function TeamsTable({ teams, companyId, onRefresh }: TeamsTableProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(null)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const handleEdit = (team: TeamWithMembers) => {
    setSelectedTeam(team)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/teams/${id}`, {
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

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!confirm("Remove this member from the team?")) return

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Remove member error:", error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedTeam(null)
    onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Teams</h2>
        <button
          onClick={() => {
            setSelectedTeam(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          New Team
        </button>
      </div>

      {showForm && <TeamForm team={selectedTeam} companyId={companyId} onClose={handleFormClose} />}

      <div className="grid gap-4">
        {teams.length === 0 ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-slate-500" size={40} />
              <p className="text-slate-400">No teams found. Create your first team.</p>
            </div>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-slate-750 transition flex items-center justify-between"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                  <p className="text-slate-400 text-sm">{team.description || "No description"}</p>
                  <p className="text-slate-500 text-xs mt-2">{team.members.length} members</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(team)
                    }}
                    className="p-2 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(team.id)
                    }}
                    disabled={deleteLoading === team.id}
                    className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="border-t border-slate-700 p-6 bg-slate-750">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white mb-3">Team Members</h4>
                    {team.members.length === 0 ? (
                      <p className="text-slate-400 text-sm">No members in this team.</p>
                    ) : (
                      <div className="space-y-2">
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">{member.user.name}</p>
                              <p className="text-slate-400 text-sm">{member.user.email}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(team.id, member.id)}
                              className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition"
                            >
                              <UserX size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
