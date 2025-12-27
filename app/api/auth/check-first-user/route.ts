import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0

    return NextResponse.json({ isFirstUser })
  } catch (error) {
    console.error("Check first user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

