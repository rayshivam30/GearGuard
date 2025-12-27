import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

async function getUserIdFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get("userId")?.value
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const workCenter = await prisma.workCenter.findUnique({
      where: { id: params.id },
    })

    if (!workCenter) {
      return NextResponse.json({ error: "Work center not found" }, { status: 404 })
    }

    const updated = await prisma.workCenter.update({
      where: { id: params.id },
      data: {
        name: body.name ?? workCenter.name,
        location: body.location ?? workCenter.location,
        costPerHour: body.costPerHour ?? workCenter.costPerHour,
        capabilityTimeEfficiency: body.capabilityTimeEfficiency ?? workCenter.capabilityTimeEfficiency,
        oeTargetPercentage: body.oeTargetPercentage ?? workCenter.oeTargetPercentage,
      },
      include: {
        assignments: {
          include: {
            equipment: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update work center error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workCenter = await prisma.workCenter.findUnique({
      where: { id: params.id },
    })

    if (!workCenter) {
      return NextResponse.json({ error: "Work center not found" }, { status: 404 })
    }

    await prisma.workCenter.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Work center deleted" })
  } catch (error) {
    console.error("Delete work center error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
