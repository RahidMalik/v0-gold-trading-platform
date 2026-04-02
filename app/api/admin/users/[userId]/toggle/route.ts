import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"


export async function PUT(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    const session = await auth();

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };

    const { userId } = await params;
    const { isActive } = await req.json();

    const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
    })

    return NextResponse.json({
        success: true,
        message: `User ${isActive} ? "activated" : "deactivated"`,
        data: user,
    })
}