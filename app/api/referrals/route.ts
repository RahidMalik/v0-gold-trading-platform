import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { 
  findUserById, 
  mockUsers, 
  getUserReferrals,
  mockSettings 
} from "@/lib/mock-data"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = findUserById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get direct referrals (Level 1)
    const directReferrals = mockUsers.filter(u => u.referredById === session.user.id)
    
    // Get Level 2 referrals (referrals of referrals)
    const level2Referrals = mockUsers.filter(u => 
      directReferrals.some(dr => dr.id === u.referredById)
    )

    // Get Level 3 referrals
    const level3Referrals = mockUsers.filter(u => 
      level2Referrals.some(l2 => l2.id === u.referredById)
    )

    // Calculate total earnings
    const referralEarnings = getUserReferrals(session.user.id)
    const totalEarnings = referralEarnings.reduce((sum, r) => sum + r.commission, 0)

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://goldinvest.com'}/register?ref=${user.referralCode}`,
        stats: {
          totalReferrals: directReferrals.length + level2Referrals.length + level3Referrals.length,
          level1Count: directReferrals.length,
          level2Count: level2Referrals.length,
          level3Count: level3Referrals.length,
          totalEarnings,
          pendingEarnings: referralEarnings.filter(r => r.status === "PENDING").reduce((sum, r) => sum + r.commission, 0),
        },
        commissionRates: {
          level1: mockSettings.referralCommissionLevel1,
          level2: mockSettings.referralCommissionLevel2,
          level3: mockSettings.referralCommissionLevel3,
        },
        referrals: {
          level1: directReferrals.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            joinedAt: r.createdAt.toISOString(),
            isActive: r.isActive,
          })),
          level2: level2Referrals.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            joinedAt: r.createdAt.toISOString(),
            isActive: r.isActive,
          })),
          level3: level3Referrals.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
            joinedAt: r.createdAt.toISOString(),
            isActive: r.isActive,
          })),
        },
        earnings: referralEarnings.map(e => ({
          id: e.id,
          level: e.level,
          commission: e.commission,
          status: e.status,
          createdAt: e.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error("Failed to fetch referral data:", error)
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    )
  }
}
