import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateEquipmentCache } from "@/lib/db-operations"
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

    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
      include: { 
        company: true, 
        maintenanceRequests: {
          where: {
            status: { not: 'CANCELLED' }
          }
        },
        assignedTechnician: {
          select: { id: true, name: true, email: true }
        },
        defaultMaintenanceTeam: {
          select: { id: true, name: true }
        }
      },
    })

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Get equipment error:", error)
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
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    })

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    const updated = await prisma.equipment.update({
      where: { id: params.id },
      data: {
        name: body.name ?? equipment.name,
        category: body.category ?? equipment.category,
        department: body.department ?? equipment.department,
        assignedTo: body.assignedTo ?? equipment.assignedTo,
        location: body.location !== undefined ? body.location : (equipment as any).location,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : (equipment as any).purchaseDate,
        warrantyInfo: body.warrantyInfo !== undefined ? body.warrantyInfo : (equipment as any).warrantyInfo,
        assignedTechnicianId: body.assignedTechnicianId !== undefined ? body.assignedTechnicianId : (equipment as any).assignedTechnicianId,
        defaultMaintenanceTeamId: body.defaultMaintenanceTeamId !== undefined ? body.defaultMaintenanceTeamId : (equipment as any).defaultMaintenanceTeamId,
        health: body.health ?? equipment.health,
        status: body.status ?? equipment.status,
        lastMaintenance: body.lastMaintenance ?? equipment.lastMaintenance,
        nextScheduled: body.nextScheduled ?? equipment.nextScheduled,
      },
      include: { 
        company: true,
        assignedTechnician: {
          select: { id: true, name: true, email: true }
        },
        defaultMaintenanceTeam: {
          select: { id: true, name: true }
        }
      },
    })

    await invalidateEquipmentCache(equipment.companyId)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update equipment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    })

    if (!equipment) {
      return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
    }

    await prisma.equipment.delete({
      where: { id: params.id },
    })

    await invalidateEquipmentCache(equipment.companyId)

    return NextResponse.json({ message: "Equipment deleted" })
  } catch (error) {
    console.error("Delete equipment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
