import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { TransactionType, TransactionStatus } from "@prisma/client"
export async function GET(req: Request) {

    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") || undefined
    const status = searchParams.get("status") || undefined

    const where = {
        ...(type && { type: type as TransactionType }),
        ...(status && { status: status as TransactionStatus }),
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ])
    return NextResponse.json({ success: true, data: transactions, total, page, limit })
}