"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, ChevronDown } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    companyName: "",
    role: "EMPLOYEE", // Default role
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await signUp(formData.email, formData.password, formData.name, { 
        name: formData.companyName
      }, formData.role)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(59,130,246,0.30),rgba(15,23,42,0)_55%),radial-gradient(50%_50%_at_15%_20%,rgba(168,85,247,0.18),rgba(15,23,42,0)_60%),radial-gradient(40%_40%_at_85%_35%,rgba(34,197,94,0.14),rgba(15,23,42,0)_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.2),rgba(2,6,23,0.95))]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(148,163,184,0.6)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 ring-1 ring-white/10">⚙️</span>
              GearGuard
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Create account</h1>
            <p className="mt-2 text-sm text-slate-300">Set up your company and start tracking maintenance</p>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-5 sm:p-6 ring-1 ring-white/10 shadow-2xl shadow-black/30 backdrop-blur">

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="Acme Industries"
                    className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-200 mb-2">Role</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg bg-black/20 px-4 py-2.5 pr-10 text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Selecting Admin will create a new company with the provided name. Other roles require an existing company name.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-400/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition hover:bg-blue-500 disabled:bg-blue-400"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-slate-300">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-semibold text-blue-300 hover:text-blue-200">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
