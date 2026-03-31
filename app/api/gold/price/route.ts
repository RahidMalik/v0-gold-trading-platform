import { NextResponse } from "next/server"
import { getGoldPrice, getGoldPriceHistory } from "@/lib/gold-price"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const includeHistory = searchParams.get("history") === "true"
  const historyDays = parseInt(searchParams.get("days") || "30")

  try {
    const currentPrice = await getGoldPrice()

    const response: {
      success: boolean
      data: typeof currentPrice & { history?: Awaited<ReturnType<typeof getGoldPriceHistory>> }
    } = {
      success: true,
      data: currentPrice,
    }

    if (includeHistory) {
      response.data = {
        ...currentPrice,
        history: await getGoldPriceHistory(historyDays),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Gold price API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch gold price" },
      { status: 500 }
    )
  }
}
