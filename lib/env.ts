// Environment variables validation
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_URL: process.env.KV_REST_API_URL || "",
  REDIS_TOKEN: process.env.KV_REST_API_TOKEN || "",
  NODE_ENV: process.env.NODE_ENV || "development",
}

export function validateEnv() {
  if (!env.DATABASE_URL) {
    console.warn("DATABASE_URL not set - database operations will fail")
  }
  if (!env.REDIS_URL || !env.REDIS_TOKEN) {
    console.warn("Redis credentials not set - caching disabled")
  }
}
