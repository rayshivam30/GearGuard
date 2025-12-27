import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { validateEnv } from "@/lib/env"

export async function POST(request: NextRequest) {
  try {
    validateEnv()
    const body = await request.json()
    const { email, password, name, company, role } = body

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

    // Determine role (default EMPLOYEE if not provided)
    const userRole: string = role || "EMPLOYEE"

    // Validate role
    const validRoles = ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]
    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Company handling based on role
    // Note: User model has no companyId link; we only create/validate company records per requirements.
    const companyName = (company?.name || "").trim()
    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    let companyId: string | null = null
    if (userRole === "ADMIN") {
      // Admin: must create a NEW company. Error if a company with same name already exists.
      const existingCompany = await prisma.company.findFirst({ where: { name: companyName } })
      if (existingCompany) {
        return NextResponse.json({ error: "Company already exists" }, { status: 409 })
      }
      const created = await prisma.company.create({
        data: {
          name: companyName,
          location: company.location || "",
        },
      })
      companyId = created.id
    } else {
      // Non-admin: must register to an EXISTING company by name
      const targetCompany = await prisma.company.findFirst({ where: { name: companyName } })
      if (!targetCompany) {
        return NextResponse.json({ error: "Company doesn't exist" }, { status: 404 })
      }
      companyId = targetCompany.id
    }

    // Create user with determined role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole as any,
        companyName: companyName,
        companyId: companyId!,
      },
    })

    // Create session (simplified - in production use proper session management)
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 })

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error: any) {
    console.error("Sign-up error:", error)
    const errPayload: any = { error: "Sign-up failed" }
    if (error?.code) errPayload.code = error.code
    if (error?.message) errPayload.details = error.message
    if (error?.meta) errPayload.meta = error.meta
    return NextResponse.json(errPayload, { status: 500 })
  }
}
