"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">GearGuard</h1>
        <p className="text-slate-400 mb-8">Create your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            >
              <option value="ADMIN">Admin</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="MANAGER">Manager</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Selecting Admin will create a new company with the provided name. Other roles require an existing company name.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {error && <div className="p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
