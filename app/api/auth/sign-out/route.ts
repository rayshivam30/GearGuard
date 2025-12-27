import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Signed out successfully" }, { status: 200 })

  response.cookies.delete("userId")

  return response
}
