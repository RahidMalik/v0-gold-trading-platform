"use client"

import { ArrowUpRight, ArrowDownRight, Gift, Bot } from "lucide-react"
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price"
import { Empty } from "@/components/ui/empty"

// Demo transactions for UI display
const demoTransactions = [
  {
    id: "1",
    type: "BUY",
    amount: 2.5,
    totalValue: 2875000,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    type: "SELL",
    amount: 1.0,
    totalValue: 1150000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    type: "REFERRAL_BONUS",
    amount: 0.1,
    totalValue: 115000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "4",
    type: "BUY",
    amount: 5.0,
    totalValue: 5750000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "5",
    type: "ASSISTANT_PROFIT",
    amount: 0.05,
    totalValue: 57500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "BUY":
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    case "SELL":
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    case "REFERRAL_BONUS":
      return <Gift className="h-4 w-4 text-primary" />
    case "ASSISTANT_PROFIT":
      return <Bot className="h-4 w-4 text-blue-600" />
    default:
      return <ArrowUpRight className="h-4 w-4" />
  }
}

const getTransactionLabel = (type: string) => {
  switch (type) {
    case "BUY":
      return "Gold Purchase"
    case "SELL":
      return "Gold Sale"
    case "REFERRAL_BONUS":
      return "Referral Bonus"
    case "ASSISTANT_PROFIT":
      return "AI Assistant Profit"
    default:
      return type
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) {
    return `${diffMins}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return `${diffDays}d ago`
  }
}

export function RecentTransactions() {
  const transactions = demoTransactions

  if (transactions.length === 0) {
    return (
      <Empty
        title="No transactions yet"
        description="Start trading to see your activity here"
      />
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            {getTransactionIcon(tx.type)}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {getTransactionLabel(tx.type)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatGoldWeight(tx.amount)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              tx.type === "SELL" ? "text-red-600" : "text-green-600"
            }`}>
              {tx.type === "SELL" ? "-" : "+"}
              {formatCurrency(tx.totalValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTimeAgo(tx.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
