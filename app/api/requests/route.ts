import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateRequestsCache } from "@/lib/db-operations"
import { cookies } from "next/headers"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value
}

function parseLocalDateInput(value: unknown) {
  if (typeof value !== "string" || !value) return null
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return new Date(value)
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  return new Date(year, month - 1, day)
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const companyId = searchParams.get("companyId")
    const status = searchParams.get("status")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    // Determine role of requesting user to apply technician-specific scoping
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, companyId: true },
    })

    // Base where clause: always scoped to company, optionally by status
    const baseWhere: any = {
      companyId,
      ...(status && { status }),
    }

    // If technician, only return requests assigned to them
    if (requestingUser?.role === "TECHNICIAN") {
      baseWhere.assignedTechnicianId = userId
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: baseWhere,
      include: {
        equipment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: true,
        assignedTechnician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Get requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, equipmentId, companyId, maintenanceType, priority, assignedTeam, scheduledDate } = body

    if (!subject || !equipmentId || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Auto-fill logic: Fetch equipment to get default maintenance team
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        defaultMaintenanceTeam: true,
        assignedTechnician: true,
      },
    })

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    // Use assignedTeam from body, or fall back to equipment's default maintenance team
    const teamId = assignedTeam || equipment.defaultMaintenanceTeamId
    // Use assignedTechnician from equipment if available
    const technicianId = equipment.assignedTechnicianId

    const parsedScheduledDate = scheduledDate ? parseLocalDateInput(scheduledDate) : null

    const req = await prisma.maintenanceRequest.create({
      data: {
        subject,
        description: description || null,
        equipmentId,
        requestedBy: userId,
        companyId,
        maintenanceType: maintenanceType || "CORRECTIVE",
        priority: priority || "MEDIUM",
        assignedTeam: teamId || null,
        assignedTechnicianId: technicianId || null,
        scheduledDate: parsedScheduledDate,
        status: "NEW",
      },
      include: {
        equipment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: true,
        assignedTechnician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await invalidateRequestsCache(companyId)

    return NextResponse.json(req, { status: 201 })
  } catch (error) {
    console.error("Create request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
