import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    referralCode: string
    goldBalance: number
    cashBalance: number
  }
  interface Session {
    user: {
      id: string
      role: string
      referralCode: string
      goldBalance: number
      cashBalance: number
      name?: string | null
      email?: string | null
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    referralCode: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        if (!email || !password) {
          throw new Error("Email and password required")
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials or account disabled")
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          referralCode: user.referralCode,
          goldBalance: Number(user.goldBalance),
          cashBalance: Number(user.cashBalance),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.referralCode = user.referralCode
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.referralCode = token.referralCode

        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { goldBalance: true, cashBalance: true },
        })

        if (freshUser) {
          session.user.goldBalance = Number(freshUser.goldBalance)
          session.user.cashBalance = Number(freshUser.cashBalance)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
})