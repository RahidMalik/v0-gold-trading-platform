import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { findUserByEmail, findUserById } from "@/lib/mock-data"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
      referralCode: string
      goldBalance: number
      cashBalance: number
    }
  }
  interface User {
    id: string
    email: string
    name: string | null
    role: string
    referralCode: string
    goldBalance: number
    cashBalance: number
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
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const user = findUserByEmail(credentials.email as string)

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
          goldBalance: user.goldBalance,
          cashBalance: user.cashBalance,
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
        
        // Fetch fresh balance data
        const freshUser = findUserById(token.id)
        
        if (freshUser) {
          session.user.goldBalance = freshUser.goldBalance
          session.user.cashBalance = freshUser.cashBalance
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
})
