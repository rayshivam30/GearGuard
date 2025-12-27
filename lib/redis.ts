// Redis client configuration
// This will be initialized when Upstash integration is added
export let redis: any = null

export function initRedis(url: string, token: string) {
  if (typeof window === "undefined") {
    // Server-side only
    const { Redis } = require("@upstash/redis")
    redis = new Redis({
      url,
      token,
    })
  }
}

export async function getCachedData(key: string) {
  if (!redis) return null
  try {
    return await redis.get(key)
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

export async function setCachedData(key: string, value: any, ttl = 3600) {
  if (!redis) return false
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
    return true
  } catch (error) {
    console.error("Redis set error:", error)
    return false
  }
}

export async function invalidateCache(pattern: string) {
  if (!redis) return false
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error("Redis invalidate error:", error)
    return false
  }
}
