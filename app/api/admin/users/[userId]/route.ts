import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { ApiResponse } from "@/types/api"

// GET single user
export async function GET(req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { userId } = await params;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 5 },
            orders: { orderBy: { createdAt: "desc" }, take: 5 },
            withdrawals: { orderBy: { createdAt: "desc" }, take: 5 },
        },
    })
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
}
// PATCH update user
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params
    const body = await req.json()

    if (session.user.id === userId && body.role && body.role !== session.user.role) {
        return NextResponse.json(
            { error: "You can't change your role!" },
            { status: 400 }
        );
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: body.name,
            email: body.email,
            phone: body.phone,
            role: body.role,
        },
    })

    return NextResponse.json({ success: true, data: user })
}

// DELETE user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await auth()
    if (!session || session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await params

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true, message: "User deleted" })
}
