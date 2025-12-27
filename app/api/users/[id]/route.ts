import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { cookies } from "next/headers"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can update users" }, { status: 403 })
    }

    const body = await request.json()
    const { name, role, department, password } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (role) {
      const validRoles = ["ADMIN", "MANAGER", "TECHNICIAN", "EMPLOYEE"]
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updateData.role = role
    }
    if (department !== undefined) updateData.department = department
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
      }
      updateData.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Only ADMIN can delete users" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (params.id === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Clean up references that block deletion (FK constraints)
    await prisma.$transaction([
      prisma.equipment.updateMany({
        where: { assignedTechnicianId: params.id },
        data: { assignedTechnicianId: null },
      }),
      prisma.maintenanceRequest.updateMany({
        where: { assignedTechnicianId: params.id },
        data: { assignedTechnicianId: null },
      }),
      prisma.user.delete({ where: { id: params.id } }),
    ])

    return NextResponse.json({ message: "User deleted" })
  } catch (error: any) {
    console.error("Delete user error:", error)
    const payload: any = { error: "Failed to delete user" }
    if (error?.code) payload.code = error.code
    if (error?.message) payload.details = error.message
    if (error?.meta) payload.meta = error.meta
    if (error?.code === 'P2025') {
      payload.error = 'User not found'
      return NextResponse.json(payload, { status: 404 })
    }
    return NextResponse.json(payload, { status: 500 })
  }
}

