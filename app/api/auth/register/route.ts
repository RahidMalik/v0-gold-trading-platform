import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { 
  findUserByEmail, 
  findUserByReferralCode, 
  mockUsers, 
  generateId, 
  generateReferralCode 
} from "@/lib/mock-data"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = findUserByEmail(validatedData.email)

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Find referrer if referral code provided
    let referrerId: string | null = null
    if (validatedData.referralCode) {
      const referrer = findUserByReferralCode(validatedData.referralCode)
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Generate unique referral code for new user
    const referralCode = generateReferralCode(validatedData.name)

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user (in demo mode, add to mock array)
    const newUser = {
      id: generateId("user"),
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "USER" as const,
      referralCode,
      referredById: referrerId,
      goldBalance: 0,
      cashBalance: 0,
      isActive: true,
      createdAt: new Date(),
    }

    // Add to mock users (in real app, this would be a database insert)
    mockUsers.push(newUser)

    return NextResponse.json({
      message: "Registration successful! You can now login with your credentials.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
