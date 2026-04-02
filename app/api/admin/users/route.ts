import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { apiClient } from "@/services";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
        return NextResponse.json({
            error: "Unauthorized"
        },
            {
                status: 401
            },
        )
    };

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const where = search ? {
        OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
        ],
    }
        : {}

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                goldBalance: true,
                cashBalance: true,
                referralCode: true,
                createdAt: true,
                _count: { select: { transactions: true, orders: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ])
    return NextResponse.json({
        success: true, data: users, total, page, limit
    })

}