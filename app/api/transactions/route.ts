import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getUserTransactions } from "@/lib/mock-data"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let transactions = getUserTransactions(session.user.id)

    if (type) {
      transactions = transactions.filter(tx => tx.type === type)
    }

    // Sort by date descending
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const total = transactions.length
    const paginatedTransactions = transactions.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        goldAmount: tx.goldAmount,
        cashAmount: tx.cashAmount,
        goldPrice: tx.goldPrice,
        status: tx.status,
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
