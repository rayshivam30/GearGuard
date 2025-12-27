import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateEquipmentCache } from "@/lib/db-operations"
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
    const companyId = searchParams.get("companyId")

    if (!companyId) {
      return NextResponse.json({ error: "Company ID required" }, { status: 400 })
    }

    const equipment = await prisma.equipment.findMany({
      where: { companyId },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(equipment)
  } catch (error) {
    console.error("Get equipment error:", error)
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
    const { 
      name, 
      serialNumber, 
      category, 
      department, 
      assignedTo, 
      location,
      purchaseDate,
      warrantyInfo,
      assignedTechnicianId,
      defaultMaintenanceTeamId,
      companyId 
    } = body

    if (!name || !serialNumber || !category || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        serialNumber,
        category,
        department: department || null,
        assignedTo: assignedTo || null,
        location: location || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        warrantyInfo: warrantyInfo || null,
        assignedTechnicianId: assignedTechnicianId || null,
        defaultMaintenanceTeamId: defaultMaintenanceTeamId || null,
        companyId,
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

    await invalidateEquipmentCache(companyId)

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error("Create equipment error:", error)
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Serial number already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
