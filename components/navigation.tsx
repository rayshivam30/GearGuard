"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up"
  const isRootPage = pathname === "/"

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" })
    router.push("/sign-in")
  }

  // Hide navigation on auth pages and root page (root has its own nav)
  if (isAuthPage || isRootPage) {
    return null
  }

  // Avoid rendering partial navigation while auth state is loading
  if (isLoading) {
    return null
  }

  // Role-based navigation items
  const getNavItems = () => {
    const role = user?.role
    const baseItems = [
      { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"] },
      { href: "/equipment", label: "Equipment", roles: ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"] },
      { href: "/requests", label: "Requests", roles: ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"] },
      { href: "/calendar", label: "Calendar", roles: ["ADMIN", "MANAGER", "TECHNICIAN"] },
      { href: "/users", label: "Users", roles: ["ADMIN"] },
    ]

    if (!role) return []
    
    return baseItems.filter(item => item.roles.includes(role))
  }

  const navItems = getNavItems()

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-400">⚙️</div>
            <Link href="/dashboard" className="text-xl font-bold text-white">
              GearGuard
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.href) ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Out & Mobile Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-700 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.href) ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
