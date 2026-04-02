import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || undefined
    const status = searchParams.get("status") || undefined
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where = {
      userId: session.user.id,
      ...(type && { type: type as any }),
      ...(status && { status: status as any }),
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          amount: true,
          pricePerGram: true,
          totalValue: true,
          fee: true,
          status: true,
          isAssistantTrade: true,
          createdAt: true,
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        pricePerGram: Number(tx.pricePerGram),
        totalValue: Number(tx.totalValue),
        fee: Number(tx.fee),
        createdAt: tx.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}