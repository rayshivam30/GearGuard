import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { invalidateTeamsCache } from "@/lib/db-operations"
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
    const { userId: memberId, role } = body

    const team = await prisma.team.findUnique({
      where: { id: params.id },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: params.id,
        userId: memberId,
        role: role || "Technician",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    await invalidateTeamsCache(team.companyId)

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Add member error:", error)
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Member already in team" }, { status: 409 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { memberId } = body

    const team = await prisma.team.findUnique({
      where: { id: params.id },
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    await prisma.teamMember.delete({
      where: {
        id: memberId,
      },
    })

    await invalidateTeamsCache(team.companyId)

    return NextResponse.json({ message: "Member removed" })
  } catch (error) {
    console.error("Remove member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
