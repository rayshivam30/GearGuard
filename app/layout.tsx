import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GearGuard - Maintenance Tracking System",
  description: "Enterprise maintenance tracking and equipment management system",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
