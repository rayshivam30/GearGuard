"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(59,130,246,0.30),rgba(15,23,42,0)_55%),radial-gradient(50%_50%_at_15%_20%,rgba(168,85,247,0.18),rgba(15,23,42,0)_60%),radial-gradient(40%_40%_at_85%_35%,rgba(34,197,94,0.14),rgba(15,23,42,0)_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.2),rgba(2,6,23,0.95))]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(148,163,184,0.6)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
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
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="mt-2 text-sm text-slate-300">Access your maintenance workspace</p>
          </div>

          <div className="mt-8 rounded-2xl bg-white/5 p-6 sm:p-8 ring-1 ring-white/10 shadow-2xl shadow-black/30 backdrop-blur">

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-black/20 px-4 py-2.5 text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="••••••••"
                />
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
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-slate-300">
                Don't have an account?{" "}
                <Link href="/sign-up" className="font-semibold text-blue-300 hover:text-blue-200">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
