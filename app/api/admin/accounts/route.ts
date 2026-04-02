import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// GET — All accounts
export async function GET() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true, isActive: true },
            },
        },
        orderBy: { user: { createdAt: "desc" } },
    })

    return NextResponse.json({ success: true, data: accounts })
}

// DELETE — Remove linked account
export async function DELETE(req: Request) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()

    await prisma.account.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Account removed" })
}