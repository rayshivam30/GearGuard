"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Settings,
  Shield,
  Users,
  Wrench,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    // Only redirect if user is logged in (after loading completes)
    if (!isLoading && user) {
      router.replace("/dashboard")
    }
  }, [user, isLoading, router])

  // If user is logged in, show minimal redirect message
  if (!isLoading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // Show landing page immediately for non-logged-in users (even while loading)

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(59,130,246,0.30),rgba(15,23,42,0)_55%),radial-gradient(50%_50%_at_15%_20%,rgba(168,85,247,0.18),rgba(15,23,42,0)_60%),radial-gradient(40%_40%_at_85%_35%,rgba(34,197,94,0.14),rgba(15,23,42,0)_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.2),rgba(2,6,23,0.95))]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(148,163,184,0.6)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 ring-1 ring-white/10">
                <span className="text-xl">⚙️</span>
              </div>
              <span className="text-lg sm:text-xl font-semibold tracking-tight">GearGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 ring-1 ring-blue-500/30 transition hover:bg-blue-500"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="py-14 sm:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                <CheckCircle2 size={14} className="text-blue-400" />
                Track assets. Route requests. Stay audit-ready.
              </div>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                The maintenance platform built for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-purple-300">
                  {" "}
                  real operations
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                GearGuard connects equipment, teams, requests, and schedules—so you can reduce downtime,
                standardize workflows, and keep every asset accountable.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/sign-up"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500 sm:w-auto"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10 sm:w-auto"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="h-2 w-2 rounded-full bg-blue-400" />
                  Role-based access
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  Kanban workflows
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                  Preventive schedules
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-1 ring-1 ring-white/10 shadow-2xl shadow-black/35">
                <div className="rounded-2xl bg-slate-950/40 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">GearGuard Preview</div>
                    <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/20">
                      Synced
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/15 ring-1 ring-white/10">
                          <Wrench size={16} className="text-blue-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Equipment</div>
                          <div className="text-xs text-slate-400">Assets • health • warranties</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/15 ring-1 ring-white/10">
                          <ClipboardList size={16} className="text-purple-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Requests</div>
                          <div className="text-xs text-slate-400">Kanban • status • owners</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-500/15 ring-1 ring-white/10">
                          <Calendar size={16} className="text-yellow-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Calendar</div>
                          <div className="text-xs text-slate-400">Preventive maintenance</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center gap-2">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-green-500/15 ring-1 ring-white/10">
                          <Users size={16} className="text-green-300" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Teams</div>
                          <div className="text-xs text-slate-400">Roles • assignments</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Equipment: Compressor A12</div>
                        <div className="text-xs text-slate-400">PM due in 3 days</div>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/5">
                        <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Request: #2041</div>
                        <div className="text-xs text-emerald-300">Assigned</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">Auto-routed to Mechanical team • Kanban updated</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Everything you need to run maintenance</h2>
              <p className="mt-2 max-w-2xl text-slate-300">
                Purpose-built modules that work together—so your data stays consistent across the entire workflow.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200"
            >
              Explore the platform
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/15 ring-1 ring-white/10">
                  <Wrench className="text-blue-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Equipment Management</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Track assets with purchase dates, warranty, health metrics, and technician defaults.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-500/15 ring-1 ring-white/10">
                  <Users className="text-green-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Team Management</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Organize roles, assign technicians, and route requests based on equipment ownership.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-purple-500/15 ring-1 ring-white/10">
                  <ClipboardList className="text-purple-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Requests (Kanban)</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Capture incidents, track progress, and keep stakeholders aligned in one board.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-yellow-500/15 ring-1 ring-white/10">
                  <Calendar className="text-yellow-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Preventive Schedules</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Plan PMs on a calendar so teams stay proactive—not reactive.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-500/15 ring-1 ring-white/10">
                  <Shield className="text-red-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Role-Based Access</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Admin, Manager, Technician, Employee—each with scoped permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/15 ring-1 ring-white/10">
                  <Settings className="text-indigo-300" size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Smart Automation</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    Auto-assign teams/techs and keep equipment status in sync with work completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-white/5 px-6 py-8 ring-1 ring-white/10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold">Built for maintenance workflows</div>
                <div className="mt-1 text-sm text-slate-300">
                  Keep equipment, teams, and requests connected—without extra overhead.
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl bg-black/10 px-4 py-3 ring-1 ring-white/10">
                  <Shield size={16} className="text-red-300" />
                  <span className="text-sm text-slate-200">Role permissions</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-black/10 px-4 py-3 ring-1 ring-white/10">
                  <ClipboardList size={16} className="text-purple-300" />
                  <span className="text-sm text-slate-200">Request lifecycle</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-black/10 px-4 py-3 ring-1 ring-white/10">
                  <Calendar size={16} className="text-yellow-300" />
                  <span className="text-sm text-slate-200">PM calendar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-2 text-slate-300">
              Connect your equipment, teams, and requests with a workflow that stays consistent end-to-end.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 ring-1 ring-white/10">
                  <span className="text-sm font-semibold text-blue-200">01</span>
                </div>
                <h3 className="text-lg font-semibold">Add equipment</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Register assets, store warranties, and set default teams for faster routing.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-500/15 ring-1 ring-white/10">
                  <span className="text-sm font-semibold text-green-200">02</span>
                </div>
                <h3 className="text-lg font-semibold">Create requests</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Capture issues and schedule PMs. GearGuard assigns the right team automatically.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 ring-1 ring-white/10">
                  <span className="text-sm font-semibold text-purple-200">03</span>
                </div>
                <h3 className="text-lg font-semibold">Track & complete</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Move work through a Kanban board and keep equipment status up to date.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 sm:py-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 via-sky-500/10 to-purple-600/20 p-8 sm:p-12 ring-1 ring-white/10">
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ready to get started?</h2>
              <p className="mt-2 max-w-2xl text-slate-200/80">
                Create an account and start organizing equipment, requests, and preventive maintenance today.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500"
                >
                  Create Your Account
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 ring-1 ring-white/10">
                <span className="text-lg">⚙️</span>
              </div>
              <span className="text-base font-semibold">GearGuard</span>
            </div>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} GearGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

