import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  amount: z.number().positive("Amount must be positive"),
  pricePerGram: z.number().positive("Price must be positive"),
})

// Referral commission — From Prisma
async function processReferralCommission(userId: string, totalValue: number) {
  const settings = await prisma.systemSettings.findFirst()
  const commissionRates = [
    Number(settings?.referralLevel1Percent || 5) / 100,
    Number(settings?.referralLevel2Percent || 3) / 100,
    Number(settings?.referralLevel3Percent || 2) / 100,
  ]

  let currentUserId = userId

  for (let level = 0; level < 3; level++) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { referredById: true },
    })

    if (!user?.referredById) break

    const commission = totalValue * commissionRates[level]

    if (commission > 0) {
      await prisma.user.update({
        where: { id: user.referredById },
        data: { cashBalance: { increment: commission } },
      })

      await prisma.referralEarning.create({
        data: {
          userId: user.referredById,
          fromUserId: userId,
          level: level + 1,
          transactionType: "TRADE",
          amount: commission,
        },
      })
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or disabled" }, { status: 404 })
    }

    const settings = await prisma.systemSettings.findFirst()
    const feePercent = Number(
      type === "BUY"
        ? settings?.buyFeePercent || 0.5
        : settings?.sellFeePercent || 0.5
    ) / 100

    const totalValue = amount * pricePerGram
    const fee = totalValue * feePercent

    if (type === "BUY") {
      const totalCost = totalValue + fee

      if (Number(user.cashBalance) < totalCost) {
        return NextResponse.json(
          { error: "Insufficient cash balance" },
          { status: 400 }
        )
      }

      // Prisma transaction — atomic operation
      const [updatedUser, transaction] = await prisma.$transaction([
        // User balance update
        prisma.user.update({
          where: { id: user.id },
          data: {
            cashBalance: { decrement: totalCost },
            goldBalance: { increment: amount },
          },
        }),
        // Transaction record
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "BUY",
            amount: amount,
            pricePerGram: pricePerGram,
            totalValue: totalValue,
            fee: fee,
            status: "COMPLETED",
          },
        }),
      ])

      // Referral commission process karo
      await processReferralCommission(user.id, totalValue)

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
          transactionId: transaction.id,
          newGoldBalance: Number(updatedUser.goldBalance),
          newCashBalance: Number(updatedUser.cashBalance),
        },
      })

    } else {
      // SELL
      if (Number(user.goldBalance) < amount) {
        return NextResponse.json(
          { error: "Insufficient gold balance" },
          { status: 400 }
        )
      }

      const netProceeds = totalValue - fee

      // Prisma transaction — atomic operation
      const [updatedUser, transaction] = await prisma.$transaction([
        // User balance update
        prisma.user.update({
          where: { id: user.id },
          data: {
            goldBalance: { decrement: amount },
            cashBalance: { increment: netProceeds },
          },
        }),
        // Transaction record
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "SELL",
            amount: amount,
            pricePerGram: pricePerGram,
            totalValue: totalValue,
            fee: fee,
            status: "COMPLETED",
          },
        }),
      ])

      // Referral commission process karo
      await processReferralCommission(user.id, totalValue)

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
          transactionId: transaction.id,
          newGoldBalance: Number(updatedUser.goldBalance),
          newCashBalance: Number(updatedUser.cashBalance),
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