"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay } from "date-fns"
import { Plus, Building2 } from "lucide-react"
import { RequestForm } from "@/components/requests/request-form"
import { useAuth } from "@/lib/auth-context"

type RequestWithRelations = {
  id: string
  subject: string
  description?: string | null
  priority: string
  maintenanceType?: string
  scheduledDate?: string | Date | null
  equipment: { name: string }
  team?: { name: string } | null
  user?: any
}

export default function CalendarPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null)

  useEffect(() => {
    // Allow ADMIN, MANAGER, TECHNICIAN, and EMPLOYEE to access calendar
    if (user && !["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"].includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, router])

  const fetchRequests = async () => {
    if (!user?.companyId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?companyId=${user.companyId}`)
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
    if (user?.companyId) {
      fetchRequests()
    } else if (user && !user.companyId) {
      setLoading(false)
    }
  }, [user])

  const getRequestsForDate = (date: Date) => {
    return requests.filter((req) => {
      if (!req.scheduledDate) return false
      return isSameDay(new Date(req.scheduledDate), date)
    })
  }

  const selectedDateRequests = selectedDate ? getRequestsForDate(selectedDate) : []

  const handleDateClick = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">Maintenance Calendar</h1>
          <p className="text-sm text-slate-300">Schedule and view preventive maintenance</p>
          {user.companyName && <p className="text-slate-400 text-sm">Company: {user.companyName}</p>}
        </div>

        {!user.companyId ? (
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 p-10 text-center shadow-xl shadow-black/20">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400 mb-4">You are not assigned to a company yet. Please contact your administrator.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 shadow-xl shadow-black/20">
            <p className="text-slate-300">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/60 p-6 shadow-xl shadow-black/20">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateClick}
                  className="w-full rounded-xl [--cell-size:44px] sm:[--cell-size:52px]"
                  classNames={{
                    root: "w-full flex justify-center",
                    months: "w-full flex justify-center relative",
                    month: "w-fit relative",
                    table: "w-fit border-collapse",
                    weekdays: "grid grid-cols-7 gap-2 justify-center",
                    week: "grid grid-cols-7 gap-2 justify-center mt-2",
                    weekday: "text-white/85 text-xs font-semibold text-center",
                    day: "relative p-0",
                    day_button:
                      "text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    outside: "text-white/35",
                    today: "bg-white/10 text-white ring-1 ring-white/10",
                    nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
                    button_previous: "text-white/80 hover:bg-white/10",
                    button_next: "text-white/80 hover:bg-white/10",
                    month_caption:
                      "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) text-white font-semibold",
                    caption_label: "text-white font-semibold",
                  }}
                  modifiers={{
                    hasRequests: (date) => getRequestsForDate(date).length > 0,
                  }}
                  modifiersClassNames={{
                    hasRequests: "bg-blue-500/25 text-white ring-1 ring-blue-400/50",
                  }}
                />
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Days with scheduled preventive maintenance
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/60 p-6 shadow-xl shadow-black/20">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </h2>
                    <p className="text-xs text-slate-400">Preventive maintenance schedule</p>
                  </div>
                  {selectedDate && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500"
                      title="Schedule new maintenance"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                {selectedDateRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-300 mb-4">No scheduled maintenance for this date</p>
                    {selectedDate && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500"
                      >
                        Schedule Maintenance
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateRequests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowDetails(true)
                        }}
                        className="w-full text-left rounded-xl bg-black/10 p-4 ring-1 ring-white/10 transition hover:bg-white/5 cursor-pointer"
                      >
                        <h3 className="font-semibold text-white mb-1 line-clamp-2">{request.subject}</h3>
                        <p className="text-sm text-slate-300/80">Equipment: {request.equipment.name}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                          <span>Priority: {request.priority}</span>
                          {request.maintenanceType && <span>Type: {request.maintenanceType}</span>}
                          {request.team && <span>Team: {request.team.name}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showForm && user.companyId && (
          <RequestForm
            request={null}
            companyId={user.companyId}
            defaultScheduledDate={selectedDate}
            defaultMaintenanceType="PREVENTIVE"
            onClose={() => {
              setShowForm(false)
              fetchRequests()
            }}
            onSuccess={() => {
              fetchRequests()
            }}
          />
        )}

        {/* Request Details Modal */}
        {showDetails && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDetails(false)} />
            <div className="relative z-10 w-full max-w-2xl mx-4 overflow-hidden rounded-2xl bg-slate-800/80 ring-1 ring-slate-700/70 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-900/40">
                <h3 className="text-lg font-semibold text-white">Request Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="inline-flex items-center justify-center rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Back
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Subject</p>
                  <p className="text-white font-medium">{selectedRequest.subject}</p>
                </div>
                {selectedRequest.description && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Description</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Equipment</p>
                    <p className="text-white font-medium">{selectedRequest.equipment?.name}</p>
                  </div>
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Priority</p>
                    <p className="text-white font-medium">{selectedRequest.priority}</p>
                  </div>
                  {selectedRequest.maintenanceType && (
                    <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400">Maintenance Type</p>
                      <p className="text-white font-medium">{selectedRequest.maintenanceType}</p>
                    </div>
                  )}
                  {selectedRequest.team && (
                    <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400">Team</p>
                      <p className="text-white font-medium">{selectedRequest.team.name}</p>
                    </div>
                  )}
                  {selectedRequest.scheduledDate && (
                    <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400">Scheduled Date</p>
                      <p className="text-white font-medium">{new Date(selectedRequest.scheduledDate).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="bg-slate-750 rounded-lg p-4 border border-slate-700">
                    <p className="text-xs text-slate-400">Requested By</p>
                    <p className="text-white font-medium">{selectedRequest.user?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

