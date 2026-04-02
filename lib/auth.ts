import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

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
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      referralCode: string
      goldBalance: number
      cashBalance: number
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
    // Google Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials Provider
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }
        if (!email || !password) throw new Error("Email and password required")

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.isActive) throw new Error("Invalid credentials or account disabled")

        const isPasswordValid = await compare(password, user.password)
        if (!isPasswordValid) throw new Error("Invalid credentials")

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
    // Save Google user to DB on signIn
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existing) {
            // New Google user — Create DB entry with referral code and Google account details
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                password: "",
                referralCode,
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            })
          } else {
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            })

            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existing.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              })
            }
          }
          return true
        } catch (error) {
          console.error("Google signIn error:", error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.referralCode = user.referralCode
      }

      if (token.email === process.env.SUPER_ADMIN_EMAIL) {
        token.role = "SUPER_ADMIN"
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.referralCode = token.referralCode

        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
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