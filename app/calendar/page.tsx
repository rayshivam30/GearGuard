"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { MaintenanceRequest, Equipment } from "@prisma/client"
import { format, isSameDay } from "date-fns"
import { Plus } from "lucide-react"
import { RequestForm } from "@/components/requests/request-form"

interface RequestWithRelations extends MaintenanceRequest {
  equipment: Equipment
  team: any
  user: any
}

export default function CalendarPage() {
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [companyId] = useState("default-company")

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        // Filter only preventive maintenance requests
        const preventiveRequests = data.filter(
          (req: RequestWithRelations) => req.maintenanceType === "PREVENTIVE"
        )
        setRequests(preventiveRequests)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const getRequestsForDate = (date: Date) => {
    return requests.filter((req) => {
      if (!req.scheduledDate) return false
      return isSameDay(new Date(req.scheduledDate), date)
    })
  }

  const selectedDateRequests = selectedDate ? getRequestsForDate(selectedDate) : []

  const handleDateClick = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setShowForm(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Calendar</h1>
          <p className="text-slate-400">Schedule and view preventive maintenance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateClick}
                  className="rounded-md border"
                  modifiers={{
                    hasRequests: (date) => getRequestsForDate(date).length > 0,
                  }}
                  modifiersClassNames={{
                    hasRequests: "bg-blue-500 text-white rounded-full",
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                  </h2>
                  {selectedDate && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      title="Schedule new maintenance"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                {selectedDateRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No scheduled maintenance for this date</p>
                    {selectedDate && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        Schedule Maintenance
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-slate-700 rounded-lg p-4 border border-slate-600"
                      >
                        <h3 className="font-semibold text-white mb-2">{request.subject}</h3>
                        <p className="text-sm text-slate-400 mb-2">
                          Equipment: {request.equipment.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Priority: {request.priority}
                        </p>
                        {request.team && (
                          <p className="text-xs text-slate-500 mt-1">
                            Team: {request.team.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <RequestForm
            request={null}
            companyId={companyId}
            onClose={() => {
              setShowForm(false)
              fetchRequests()
            }}
            onSuccess={() => {
              fetchRequests()
            }}
          />
        )}
      </div>
    </div>
  )
}

