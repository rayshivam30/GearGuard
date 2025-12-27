import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { validateEnv } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    validateEnv()
    const body = await request.json()
    const { email, password, name, company } = body

    // Validation
    if (!email || !password || !name || !company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create company if needed
    let companyId = company.id
    if (!companyId) {
      const newCompany = await prisma.company.create({
        data: {
          name: company.name,
          location: company.location || "",
        },
      })
      companyId = newCompany.id
    }

    // Create user with admin role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    })

    // Create session (simplified - in production use proper session management)
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 })

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Sign-up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
