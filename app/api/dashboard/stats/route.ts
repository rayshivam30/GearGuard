import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis"
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

    // Get requesting user (for role-based scoping)
    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })

    // Use a cache key that also considers userId for technician-specific scoping
    const cacheKey = `dashboard:stats:${companyId}${requestingUser?.role === "TECHNICIAN" ? `:tech:${userId}` : ""}`
    const cached = await getCachedData(cacheKey)

    if (cached) {
      return NextResponse.json(JSON.parse(cached))
    }

    // Get equipment stats
    const totalEquipment = await prisma.equipment.count({
      where: { companyId },
    })

    const criticalEquipment = await prisma.equipment.count({
      where: { companyId, status: "CRITICAL" },
    })

    const averageHealth = await prisma.equipment.aggregate({
      where: { companyId },
      _avg: { health: true },
    })

    // Build where clause for requests, scoped to technician if applicable
    const requestWhereBase: any = { companyId }
    if (requestingUser?.role === "TECHNICIAN") {
      requestWhereBase.assignedTechnicianId = userId
    }

    // Get request stats
    const totalRequests = await prisma.maintenanceRequest.count({
      where: requestWhereBase,
    })

    const newRequests = await prisma.maintenanceRequest.count({
      where: { ...requestWhereBase, status: "NEW" },
    })

    const inProgressRequests = await prisma.maintenanceRequest.count({
      where: { ...requestWhereBase, status: "IN_PROGRESS" },
    })

    const repairedRequests = await prisma.maintenanceRequest.count({
      where: { ...requestWhereBase, status: "REPAIRED" },
    })

    // Get team stats
    const totalTeams = await prisma.team.count({
      where: { companyId },
    })

    const stats = {
      equipment: {
        total: totalEquipment,
        critical: criticalEquipment,
        averageHealth: Math.round((averageHealth._avg.health || 0) * 100) / 100,
      },
      requests: {
        total: totalRequests,
        new: newRequests,
        inProgress: inProgressRequests,
        repaired: repairedRequests,
        completed: repairedRequests, // alias for UI
        completionRate: totalRequests > 0 ? Math.round((repairedRequests / totalRequests) * 100) : 0,
      },
      teams: {
        total: totalTeams,
      },
    }

    await setCachedData(cacheKey, stats, 300) // 5 min cache

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
