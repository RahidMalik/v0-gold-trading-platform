import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { 
  findUserById, 
  mockUsers, 
  mockWithdrawals, 
  mockSettings,
  generateId,
  getUserWithdrawals
} from "@/lib/mock-data"

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["BANK_TRANSFER", "GOLD_DELIVERY", "CRYPTO"]),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    cryptoAddress: z.string().optional(),
    deliveryAddress: z.string().optional(),
  }).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const withdrawals = getUserWithdrawals(session.user.id)
    
    // Sort by date descending
    withdrawals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json({
      success: true,
      data: withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        method: w.method,
        status: w.status,
        bankDetails: w.bankDetails ? JSON.parse(w.bankDetails) : null,
        createdAt: w.createdAt.toISOString(),
        processedAt: w.processedAt?.toISOString() || null,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch withdrawals:", error)
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, method, bankDetails } = withdrawalSchema.parse(body)

    // Validate withdrawal limits
    if (amount < mockSettings.minimumWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${mockSettings.minimumWithdrawal}` },
        { status: 400 }
      )
    }

    if (amount > mockSettings.maximumWithdrawal) {
      return NextResponse.json(
        { error: `Maximum withdrawal is $${mockSettings.maximumWithdrawal}` },
        { status: 400 }
      )
    }

    const userIndex = mockUsers.findIndex(u => u.id === session.user.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = mockUsers[userIndex]

    if (user.cashBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient cash balance" },
        { status: 400 }
      )
    }

    // Check for pending withdrawals
    const pendingWithdrawals = getUserWithdrawals(session.user.id).filter(
      w => w.status === "PENDING" || w.status === "PROCESSING"
    )

    if (pendingWithdrawals.length > 0) {
      return NextResponse.json(
        { error: "You have a pending withdrawal. Please wait for it to be processed." },
        { status: 400 }
      )
    }

    // Create withdrawal request
    const withdrawal = {
      id: generateId("wd"),
      userId: session.user.id,
      amount,
      method,
      status: "PENDING" as const,
      bankDetails: bankDetails ? JSON.stringify(bankDetails) : null,
      adminNotes: null,
      createdAt: new Date(),
      processedAt: null,
    }

    mockWithdrawals.push(withdrawal)

    // Deduct from balance (held until approved)
    mockUsers[userIndex].cashBalance -= amount

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt.toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Withdrawal error:", error)
    return NextResponse.json(
      { error: "Withdrawal request failed. Please try again." },
      { status: 500 }
    )
  }
}
