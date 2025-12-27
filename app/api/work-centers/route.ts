import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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

    const workCenters = await prisma.workCenter.findMany({
      where: { companyId },
      include: {
        assignments: {
          include: {
            equipment: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workCenters)
  } catch (error) {
    console.error("Get work centers error:", error)
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
    const { name, code, location, costPerHour, companyId } = body

    if (!name || !code || !companyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const workCenter = await prisma.workCenter.create({
      data: {
        name,
        code,
        location: location || null,
        costPerHour: costPerHour || 0,
        companyId,
      },
      include: {
        assignments: true,
      },
    })

    return NextResponse.json(workCenter, { status: 201 })
  } catch (error) {
    console.error("Create work center error:", error)
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Work center code already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
