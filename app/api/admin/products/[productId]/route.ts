import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params
    const body = await req.json()

    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            name: body.name,
            description: body.description,
            price: body.price,
            stock: body.stock,
            isActive: body.isActive,
        },
    })

    return NextResponse.json({ success: true, data: product })
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await params

    await prisma.product.delete({ where: { id: productId } })

    return NextResponse.json({ success: true, message: "Product deleted" })
}