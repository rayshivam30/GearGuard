import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateRequestsCache } from "@/lib/db-operations"
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

    const req = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
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

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json(req)
  } catch (error) {
    console.error("Get request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const req = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
    })

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const newStatus = body.status ?? req.status
    
    // Scrap logic: If status is changed to SCRAP, mark equipment as OUT_OF_SERVICE
    if (newStatus === "SCRAP" && req.status !== "SCRAP") {
      await prisma.equipment.update({
        where: { id: req.equipmentId },
        data: {
          status: "OUT_OF_SERVICE",
        },
      })
    }

    // If status is changed to REPAIRED, update equipment health and last maintenance
    if (newStatus === "REPAIRED" && req.status !== "REPAIRED") {
      const equipment = await prisma.equipment.findUnique({
        where: { id: req.equipmentId },
      })
      
      if (equipment) {
        await prisma.equipment.update({
          where: { id: req.equipmentId },
          data: {
            status: "OPERATIONAL",
            lastMaintenance: new Date(),
            health: Math.min(100, (equipment.health || 0) + 20), // Increase health by 20%
          },
        })
      }
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: {
        subject: body.subject ?? req.subject,
        description: body.description ?? req.description,
        status: newStatus,
        priority: body.priority ?? req.priority,
        maintenanceType: body.maintenanceType ?? req.maintenanceType,
        assignedTeam: body.assignedTeam ?? req.assignedTeam,
        assignedTechnicianId: body.assignedTechnicianId ?? req.assignedTechnicianId,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : req.scheduledDate,
        completedDate: body.completedDate ? new Date(body.completedDate) : req.completedDate,
        duration: body.duration ?? req.duration,
        notes: body.notes ?? req.notes,
        instructions: body.instructions ?? req.instructions,
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

    await invalidateRequestsCache(req.companyId)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const req = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
    })

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await prisma.maintenanceRequest.delete({
      where: { id: params.id },
    })

    await invalidateRequestsCache(req.companyId)

    return NextResponse.json({ message: "Request deleted" })
  } catch (error) {
    console.error("Delete request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
