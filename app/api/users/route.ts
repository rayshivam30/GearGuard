import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { cookies } from "next/headers"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")

    // Determine current user's company for scoping
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, companyName: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If the current user has no company assigned, do not return any users to avoid leaking other tenants
    if (!currentUser.companyId && !currentUser.companyName) {
      return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
      where: currentUser.companyId
        ? {
            companyId: currentUser.companyId,
            ...(role && { role: role as any }),
          }
        : {
            companyName: currentUser.companyName as string,
            ...(role && { role: role as any }),
          },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        companyName: true,
        companyId: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is ADMIN and get their company for scoping
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyName: true, companyId: true },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can create users" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name, role, department, companyName } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
        department: department || null,
        companyName: companyName || currentUser.companyName || null,
        companyId: currentUser.companyId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        companyName: true,
        companyId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
