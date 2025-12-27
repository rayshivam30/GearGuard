import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { equipmentId, alternativeWorkCenters } = body

    const workCenter = await prisma.workCenter.findUnique({
      where: { id: params.id },
    })

    if (!workCenter) {
      return NextResponse.json({ error: "Work center not found" }, { status: 404 })
    }

    const assignment = await prisma.workCenterAssignment.create({
      data: {
        workCenterId: params.id,
        equipmentId,
        assignedBy: userId,
        alternativeWorkCenters: alternativeWorkCenters ? JSON.stringify(alternativeWorkCenters) : null,
      },
      include: {
        workCenter: true,
        equipment: true,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Assign equipment error:", error)
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Equipment already assigned to this work center" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
