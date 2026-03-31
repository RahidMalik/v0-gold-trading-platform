import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { 
  findUserById, 
  mockUsers, 
  mockTransactions, 
  mockReferrals,
  mockSettings,
  generateId 
} from "@/lib/mock-data"

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  amount: z.number().positive("Amount must be positive"),
  pricePerGram: z.number().positive("Price must be positive"),
})

// Helper to handle referral commissions
function processReferralCommission(
  userId: string,
  totalValue: number
) {
  const commissionRates = [
    mockSettings.referralCommissionLevel1 / 100,
    mockSettings.referralCommissionLevel2 / 100,
    mockSettings.referralCommissionLevel3 / 100,
  ]

  let currentUserId = userId
  for (let level = 1; level <= 3; level++) {
    const user = findUserById(currentUserId)
    if (!user?.referredById) break

    const commission = totalValue * commissionRates[level - 1]
    
    if (commission > 0) {
      // Add commission to referrer's cash balance
      const referrerIndex = mockUsers.findIndex(u => u.id === user.referredById)
      if (referrerIndex !== -1) {
        mockUsers[referrerIndex].cashBalance += commission
      }
    }

    currentUserId = user.referredById
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, amount, pricePerGram } = tradeSchema.parse(body)

    const userIndex = mockUsers.findIndex(u => u.id === session.user.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = mockUsers[userIndex]
    const feePercent = 0.5 / 100 // 0.5% fee
    const totalValue = amount * pricePerGram
    const fee = totalValue * feePercent

    if (type === "BUY") {
      const totalCost = totalValue + fee

      if (user.cashBalance < totalCost) {
        return NextResponse.json(
          { error: "Insufficient cash balance" },
          { status: 400 }
        )
      }

      // Execute buy trade
      mockUsers[userIndex].cashBalance -= totalCost
      mockUsers[userIndex].goldBalance += amount

      // Record transaction
      mockTransactions.push({
        id: generateId("txn"),
        userId: user.id,
        type: "BUY",
        goldAmount: amount,
        cashAmount: totalCost,
        goldPrice: pricePerGram,
        status: "COMPLETED",
        createdAt: new Date(),
      })

      // Process referral commissions
      processReferralCommission(user.id, totalValue)

      return NextResponse.json({
        success: true,
        message: "Buy order executed successfully",
        data: {
          type: "BUY",
          amount,
          pricePerGram,
          totalValue,
          fee,
          totalCost,
          newGoldBalance: mockUsers[userIndex].goldBalance,
          newCashBalance: mockUsers[userIndex].cashBalance,
        },
      })
    } else {
      // SELL
      if (user.goldBalance < amount) {
        return NextResponse.json(
          { error: "Insufficient gold balance" },
          { status: 400 }
        )
      }

      const netProceeds = totalValue - fee

      // Execute sell trade
      mockUsers[userIndex].goldBalance -= amount
      mockUsers[userIndex].cashBalance += netProceeds

      // Record transaction
      mockTransactions.push({
        id: generateId("txn"),
        userId: user.id,
        type: "SELL",
        goldAmount: amount,
        cashAmount: netProceeds,
        goldPrice: pricePerGram,
        status: "COMPLETED",
        createdAt: new Date(),
      })

      // Process referral commissions
      processReferralCommission(user.id, totalValue)

      return NextResponse.json({
        success: true,
        message: "Sell order executed successfully",
        data: {
          type: "SELL",
          amount,
          pricePerGram,
          totalValue,
          fee,
          netProceeds,
          newGoldBalance: mockUsers[userIndex].goldBalance,
          newCashBalance: mockUsers[userIndex].cashBalance,
        },
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Trade error:", error)
    return NextResponse.json(
      { error: "Trade failed. Please try again." },
      { status: 500 }
    )
  }
}
