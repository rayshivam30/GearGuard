// Database operations with caching
import { prisma } from "./prisma"
import { getCachedData, setCachedData, invalidateCache } from "./redis"

export async function getEquipmentWithCache(companyId: string) {
  const cacheKey = `equipment:${companyId}`
  const cached = await getCachedData(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const equipment = await prisma.equipment.findMany({
    where: { companyId },
    include: {
      company: true,
    },
    orderBy: { createdAt: "desc" },
  })

  await setCachedData(cacheKey, equipment, 1800) // 30 min cache
  return equipment
}

export async function getTeamsWithCache(companyId: string) {
  const cacheKey = `teams:${companyId}`
  const cached = await getCachedData(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const teams = await prisma.team.findMany({
    where: { companyId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  await setCachedData(cacheKey, teams, 1800)
  return teams
}

export async function getMaintenanceRequestsWithCache(companyId: string, status?: string) {
  const cacheKey = `requests:${companyId}${status ? `:${status}` : ""}`
  const cached = await getCachedData(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      companyId,
      ...(status && { status }),
    },
    include: {
      equipment: true,
      user: true,
      team: true,
    },
    orderBy: { createdAt: "desc" },
  })

  await setCachedData(cacheKey, requests, 600) // 10 min cache
  return requests
}

export async function invalidateEquipmentCache(companyId: string) {
  return invalidateCache(`equipment:${companyId}*`)
}

export async function invalidateTeamsCache(companyId: string) {
  return invalidateCache(`teams:${companyId}*`)
}

export async function invalidateRequestsCache(companyId: string) {
  return invalidateCache(`requests:${companyId}*`)
}
