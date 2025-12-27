"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Wrench, Shield, Users, ClipboardList, Calendar, Settings } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-blue-400">⚙️</div>
              <span className="text-2xl font-bold text-white">GearGuard</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            The Ultimate
            <span className="text-blue-400"> Maintenance Tracker</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Seamlessly connect Equipment, Teams, and Requests to manage all your company assets
            and maintenance workflows in one powerful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium text-lg border border-slate-700"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Wrench className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Equipment Management</h3>
            <p className="text-slate-400">
              Track all company assets with detailed information including purchase dates, warranty,
              location, and assigned technicians.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-green-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Team Management</h3>
            <p className="text-slate-400">
              Organize maintenance teams with specialized roles. Assign technicians to teams and
              route requests automatically.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-purple-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Maintenance Requests</h3>
            <p className="text-slate-400">
              Create and track maintenance requests with Kanban board workflow. Support for
              corrective and preventive maintenance.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-yellow-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="text-yellow-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Calendar View</h3>
            <p className="text-slate-400">
              Schedule and view preventive maintenance on an intuitive calendar. Never miss a
              scheduled maintenance task.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-red-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-red-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
            <p className="text-slate-400">
              Secure access control with Admin, Manager, Technician, and Employee roles. Each role
              has appropriate permissions.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
            <div className="bg-indigo-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Settings className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Automation</h3>
            <p className="text-slate-400">
              Auto-fill teams and technicians from equipment defaults. Automatic status updates and
              health tracking.
            </p>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Connect your equipment, teams, and maintenance requests in a seamless workflow
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Add Equipment</h3>
              <p className="text-slate-400">
                Register all your company assets with detailed information and assign default
                maintenance teams.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create Requests</h3>
              <p className="text-slate-400">
                Create maintenance requests. The system automatically assigns teams and technicians
                based on equipment settings.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track & Complete</h3>
              <p className="text-slate-400">
                Use the Kanban board to track progress. Complete maintenance and automatically
                update equipment status.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-12 border border-slate-700">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join companies using GearGuard to streamline their maintenance operations
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="text-2xl font-bold text-blue-400">⚙️</div>
              <span className="text-xl font-bold text-white">GearGuard</span>
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

