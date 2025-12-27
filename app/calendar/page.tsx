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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Maintenance Calendar</h1>
          <p className="text-slate-400">Schedule and view preventive maintenance</p>
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
                      <button
                        key={request.id}
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowDetails(true)
                        }}
                        className="w-full text-left bg-slate-700 hover:bg-slate-650 rounded-lg p-4 border border-slate-600 transition cursor-pointer"
                      >
                        <h3 className="font-semibold text-white mb-1">{request.subject}</h3>
                        <p className="text-sm text-slate-400">Equipment: {request.equipment.name}</p>
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
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowDetails(false)} />
            <div className="relative z-10 w-full max-w-2xl mx-4 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Request Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 cursor-pointer"
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

