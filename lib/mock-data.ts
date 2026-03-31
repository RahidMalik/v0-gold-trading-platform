// Mock data for demo purposes - Replace with real database calls when MySQL is connected
// This allows the UI to function without a database connection

import { hash } from "bcryptjs"

export type MockUser = {
  id: string
  email: string
  name: string
  password: string
  role: "USER" | "ADMIN"
  referralCode: string
  referredById: string | null
  goldBalance: number
  cashBalance: number
  isActive: boolean
  createdAt: Date
}

export type MockTransaction = {
  id: string
  userId: string
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "REFERRAL_BONUS"
  goldAmount: number
  cashAmount: number
  goldPrice: number
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  createdAt: Date
}

export type MockWithdrawal = {
  id: string
  userId: string
  amount: number
  method: "BANK_TRANSFER" | "GOLD_DELIVERY" | "CRYPTO"
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED"
  bankDetails: string | null
  adminNotes: string | null
  createdAt: Date
  processedAt: Date | null
}

export type MockProduct = {
  id: string
  name: string
  description: string
  category: "COINS" | "BARS" | "JEWELRY"
  weight: number
  purity: number
  price: number
  stock: number
  images: string[]
  isActive: boolean
}

export type MockOrder = {
  id: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  totalAmount: number
  shippingAddress: string
  trackingNumber: string | null
  items: Array<{ productId: string; quantity: number; price: number }>
  createdAt: Date
}

export type MockReferral = {
  id: string
  referrerId: string
  referredId: string
  level: number
  commission: number
  status: "PENDING" | "CREDITED"
  createdAt: Date
}

// Demo users - password is "demo123" for all
const hashedPassword = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4o.bnLBALXRALhGi"

export const mockUsers: MockUser[] = [
  {
    id: "user-1",
    email: "demo@goldinvest.com",
    name: "John Doe",
    password: hashedPassword,
    role: "USER",
    referralCode: "GOLD123",
    referredById: null,
    goldBalance: 15.5,
    cashBalance: 25000,
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "user-2",
    email: "admin@goldinvest.com",
    name: "Admin User",
    password: hashedPassword,
    role: "ADMIN",
    referralCode: "ADMIN001",
    referredById: null,
    goldBalance: 100,
    cashBalance: 500000,
    isActive: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "user-3",
    email: "sarah@example.com",
    name: "Sarah Johnson",
    password: hashedPassword,
    role: "USER",
    referralCode: "SARAH456",
    referredById: "user-1",
    goldBalance: 8.2,
    cashBalance: 12000,
    isActive: true,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "user-4",
    email: "mike@example.com",
    name: "Mike Wilson",
    password: hashedPassword,
    role: "USER",
    referralCode: "MIKE789",
    referredById: "user-1",
    goldBalance: 5.0,
    cashBalance: 8000,
    isActive: true,
    createdAt: new Date("2024-03-10"),
  },
]

export const mockTransactions: MockTransaction[] = [
  {
    id: "txn-1",
    userId: "user-1",
    type: "BUY",
    goldAmount: 5.0,
    cashAmount: 10000,
    goldPrice: 2000,
    status: "COMPLETED",
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "txn-2",
    userId: "user-1",
    type: "BUY",
    goldAmount: 3.5,
    cashAmount: 7350,
    goldPrice: 2100,
    status: "COMPLETED",
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "txn-3",
    userId: "user-1",
    type: "SELL",
    goldAmount: 2.0,
    cashAmount: 4300,
    goldPrice: 2150,
    status: "COMPLETED",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "txn-4",
    userId: "user-1",
    type: "DEPOSIT",
    goldAmount: 0,
    cashAmount: 15000,
    goldPrice: 0,
    status: "COMPLETED",
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "txn-5",
    userId: "user-1",
    type: "REFERRAL_BONUS",
    goldAmount: 0,
    cashAmount: 500,
    goldPrice: 0,
    status: "COMPLETED",
    createdAt: new Date("2024-03-12"),
  },
]

export const mockWithdrawals: MockWithdrawal[] = [
  {
    id: "wd-1",
    userId: "user-1",
    amount: 5000,
    method: "BANK_TRANSFER",
    status: "COMPLETED",
    bankDetails: JSON.stringify({ bankName: "Chase", accountNumber: "****1234" }),
    adminNotes: "Verified and processed",
    createdAt: new Date("2024-02-15"),
    processedAt: new Date("2024-02-16"),
  },
  {
    id: "wd-2",
    userId: "user-1",
    amount: 2000,
    method: "BANK_TRANSFER",
    status: "PENDING",
    bankDetails: JSON.stringify({ bankName: "Chase", accountNumber: "****1234" }),
    adminNotes: null,
    createdAt: new Date("2024-03-20"),
    processedAt: null,
  },
  {
    id: "wd-3",
    userId: "user-3",
    amount: 3000,
    method: "BANK_TRANSFER",
    status: "PENDING",
    bankDetails: JSON.stringify({ bankName: "BOA", accountNumber: "****5678" }),
    adminNotes: null,
    createdAt: new Date("2024-03-21"),
    processedAt: null,
  },
]

export const mockProducts: MockProduct[] = [
  {
    id: "prod-1",
    name: "1 oz Gold American Eagle",
    description: "The Gold American Eagle is the official gold bullion coin of the United States. Each coin contains one troy ounce of 22-karat gold.",
    category: "COINS",
    weight: 31.1,
    purity: 91.67,
    price: 2150,
    stock: 50,
    images: ["/products/gold-eagle.jpg"],
    isActive: true,
  },
  {
    id: "prod-2",
    name: "1 oz Gold Canadian Maple Leaf",
    description: "The Canadian Gold Maple Leaf is one of the purest gold coins in the world at .9999 fine gold.",
    category: "COINS",
    weight: 31.1,
    purity: 99.99,
    price: 2200,
    stock: 35,
    images: ["/products/maple-leaf.jpg"],
    isActive: true,
  },
  {
    id: "prod-3",
    name: "100g Gold Bar - PAMP Suisse",
    description: "PAMP Suisse gold bars are among the most trusted and recognized gold bars worldwide. 999.9 fine gold.",
    category: "BARS",
    weight: 100,
    purity: 99.99,
    price: 6800,
    stock: 20,
    images: ["/products/pamp-bar.jpg"],
    isActive: true,
  },
  {
    id: "prod-4",
    name: "1 kg Gold Bar - Heraeus",
    description: "The 1 kilogram Heraeus gold bar is ideal for serious investors. 999.9 fine gold with certificate.",
    category: "BARS",
    weight: 1000,
    purity: 99.99,
    price: 68000,
    stock: 5,
    images: ["/products/heraeus-bar.jpg"],
    isActive: true,
  },
  {
    id: "prod-5",
    name: "22K Gold Chain Necklace",
    description: "Elegant 22K gold chain necklace, 20 inches, perfect for daily wear or special occasions.",
    category: "JEWELRY",
    weight: 25,
    purity: 91.67,
    price: 1800,
    stock: 15,
    images: ["/products/gold-chain.jpg"],
    isActive: true,
  },
  {
    id: "prod-6",
    name: "1 oz Gold Krugerrand",
    description: "The South African Krugerrand was the first modern gold bullion coin. Contains exactly 1 oz of pure gold.",
    category: "COINS",
    weight: 33.93,
    purity: 91.67,
    price: 2100,
    stock: 40,
    images: ["/products/krugerrand.jpg"],
    isActive: true,
  },
]

export const mockOrders: MockOrder[] = [
  {
    id: "order-1",
    userId: "user-1",
    status: "DELIVERED",
    totalAmount: 4350,
    shippingAddress: "123 Gold St, New York, NY 10001",
    trackingNumber: "1Z999AA10123456784",
    items: [
      { productId: "prod-1", quantity: 2, price: 2150 },
    ],
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "order-2",
    userId: "user-1",
    status: "SHIPPED",
    totalAmount: 6800,
    shippingAddress: "123 Gold St, New York, NY 10001",
    trackingNumber: "1Z999AA10123456785",
    items: [
      { productId: "prod-3", quantity: 1, price: 6800 },
    ],
    createdAt: new Date("2024-03-18"),
  },
]

export const mockReferrals: MockReferral[] = [
  {
    id: "ref-1",
    referrerId: "user-1",
    referredId: "user-3",
    level: 1,
    commission: 250,
    status: "CREDITED",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "ref-2",
    referrerId: "user-1",
    referredId: "user-4",
    level: 1,
    commission: 250,
    status: "CREDITED",
    createdAt: new Date("2024-03-10"),
  },
]

// Platform settings
export const mockSettings = {
  referralCommissionLevel1: 5, // 5%
  referralCommissionLevel2: 2, // 2%
  referralCommissionLevel3: 1, // 1%
  minimumWithdrawal: 100,
  maximumWithdrawal: 50000,
  goldSpread: 1.5, // 1.5% spread between buy/sell
  assistantEnabled: true,
  assistantMinInvestment: 1000,
  assistantMaxDailyTrades: 10,
}

// Helper functions
export function findUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find(u => u.email === email)
}

export function findUserById(id: string): MockUser | undefined {
  return mockUsers.find(u => u.id === id)
}

export function findUserByReferralCode(code: string): MockUser | undefined {
  return mockUsers.find(u => u.referralCode === code)
}

export function getUserTransactions(userId: string): MockTransaction[] {
  return mockTransactions.filter(t => t.userId === userId)
}

export function getUserWithdrawals(userId: string): MockWithdrawal[] {
  return mockWithdrawals.filter(w => w.userId === userId)
}

export function getUserOrders(userId: string): MockOrder[] {
  return mockOrders.filter(o => o.userId === userId)
}

export function getUserReferrals(userId: string): MockReferral[] {
  return mockReferrals.filter(r => r.referrerId === userId)
}

export function getAllProducts(): MockProduct[] {
  return mockProducts.filter(p => p.isActive)
}

export function getProductById(id: string): MockProduct | undefined {
  return mockProducts.find(p => p.id === id)
}

// Generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Generate referral code
export function generateReferralCode(name: string): string {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4)
  const suffix = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${suffix}`
}
