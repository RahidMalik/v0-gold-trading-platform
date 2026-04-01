import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    let referrerId: string | null = null
    if (validatedData.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: validatedData.referralCode }
      })
      if (referrer) {
        referrerId = referrer.id
      }
    }

    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const hashedPassword = await hash(validatedData.password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        referralCode: newReferralCode,
        referredById: referrerId,
      }
    })

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