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
    const category = searchParams.get("category") || undefined

    const where = category ? { category: category as any } : {}

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return NextResponse.json({ success: true, data: products, total, page, limit })
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const product = await prisma.product.create({
        data: {
            name: body.name,
            description: body.description,
            category: body.category,
            weight: body.weight,
            purity: body.purity || "24K",
            price: body.price,
            stock: body.stock || 0,
            images: body.images || [],
        },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
}