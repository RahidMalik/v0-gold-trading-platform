import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  amount: z.number().positive("Amount must be positive"),
  pricePerGram: z.number().positive("Price must be positive"),
})

// Helper to handle referral commissions
async function processReferralCommission(
  userId: string,
  transactionType: string,
  totalValue: number
) {
  try {
    // Get system settings for commission rates
    const settings = await prisma.systemSettings.findFirst()
    if (!settings) return

    const commissionRates = [
      Number(settings.referralLevel1Percent) / 100,
      Number(settings.referralLevel2Percent) / 100,
      Number(settings.referralLevel3Percent) / 100,
    ]

    // Find the user and their referral chain
    let currentUserId = userId
    for (let level = 1; level <= 3; level++) {
      const user = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { referredById: true },
      })

      if (!user?.referredById) break

      const commission = totalValue * commissionRates[level - 1]
      
      if (commission > 0) {
        // Add commission to referrer's cash balance
        await prisma.user.update({
          where: { id: user.referredById },
          data: {
            cashBalance: { increment: commission },
          },
        })

        // Record the referral earning
        await prisma.referralEarning.create({
          data: {
            userId: user.referredById,
            fromUserId: userId,
            level,
            transactionType,
            amount: commission,
          },
        })
      }

      currentUserId = user.referredById
    }
  } catch (error) {
    console.error("Failed to process referral commission:", error)
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get fee settings
    const settings = await prisma.systemSettings.findFirst()
    const feePercent = type === "BUY" 
      ? Number(settings?.buyFeePercent || 0.5) / 100
      : Number(settings?.sellFeePercent || 0.5) / 100

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

      // Execute buy trade
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            cashBalance: { decrement: totalCost },
            goldBalance: { increment: amount },
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "BUY",
            amount: new Decimal(amount),
            pricePerGram: new Decimal(pricePerGram),
            totalValue: new Decimal(totalValue),
            fee: new Decimal(fee),
            status: "COMPLETED",
          },
        }),
        prisma.goldPrice.create({
          data: {
            pricePerGram: new Decimal(pricePerGram),
          },
        }),
      ])

      // Process referral commissions
      await processReferralCommission(user.id, "BUY", totalValue)

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

      // Execute sell trade
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            goldBalance: { decrement: amount },
            cashBalance: { increment: netProceeds },
          },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "SELL",
            amount: new Decimal(amount),
            pricePerGram: new Decimal(pricePerGram),
            totalValue: new Decimal(totalValue),
            fee: new Decimal(fee),
            status: "COMPLETED",
          },
        }),
      ])

      // Process referral commissions
      await processReferralCommission(user.id, "SELL", totalValue)

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
