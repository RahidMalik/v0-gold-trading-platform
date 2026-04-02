import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || undefined

    const where = status ? { status: status as any } : {}

    const [withdrawals, total] = await Promise.all([
        prisma.withdrawal.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }
        }),
        prisma.withdrawal.count({ where }),
    ])
    return NextResponse.json({ success: true, data: withdrawals, total, page, limit })
}

// PATCH — approve/reject withdrawal
export async function PATCH(req: Request) {

    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, status, adminNotes } = await req.json()

    const withdrawal = await prisma.withdrawal.update({
        where: { id },
        data: {
            status,
            adminNotes,
            processedAt: ["APPROVED", "REJECTED"].includes(status) ? new Date() : undefined,
        },
    })

    return NextResponse.json({ success: true, data: withdrawal })
}
