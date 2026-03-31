"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Banknote,
  Download,
} from "lucide-react"
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price"
import Link from "next/link"

interface Transaction {
  id: string
  type: string
  amount: number
  pricePerGram: number
  totalValue: number
  fee: number
  status: string
  createdAt: string
}

export default function PortfolioPage() {
  const { data: session } = useSession()
  const [goldPrice, setGoldPrice] = useState<number>(1150000)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const user = session?.user

  useEffect(() => {
    // Fetch gold price
    fetch("/api/gold/price")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGoldPrice(data.data.pricePerGram)
        }
      })
      .catch(console.error)

    // Fetch transactions
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.data)
        }
      })
      .catch(console.error)
  }, [])

  // Portfolio calculations
  const goldValue = (user?.goldBalance || 0) * goldPrice
  const cashValue = user?.cashBalance || 0
  const totalValue = goldValue + cashValue
  const goldPercent = totalValue > 0 ? (goldValue / totalValue) * 100 : 0
  const cashPercent = totalValue > 0 ? (cashValue / totalValue) * 100 : 0

  const pieData = [
    { name: "Gold", value: goldValue, color: "oklch(0.75 0.15 75)" },
    { name: "Cash", value: cashValue, color: "oklch(0.5 0.05 60)" },
  ].filter((item) => item.value > 0)

  // Demo transactions for display
  const demoTransactions: Transaction[] = [
    {
      id: "1",
      type: "BUY",
      amount: 2.5,
      pricePerGram: 1150000,
      totalValue: 2875000,
      fee: 14375,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "2",
      type: "SELL",
      amount: 1.0,
      pricePerGram: 1145000,
      totalValue: 1145000,
      fee: 5725,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "3",
      type: "BUY",
      amount: 5.0,
      pricePerGram: 1140000,
      totalValue: 5700000,
      fee: 28500,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "4",
      type: "DEPOSIT",
      amount: 0,
      pricePerGram: 0,
      totalValue: 10000000,
      fee: 0,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ]

  const displayTransactions = transactions.length > 0 ? transactions : demoTransactions

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">My Portfolio</h1>
          <p className="text-muted-foreground">
            Track your gold investments and transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/trade">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trade
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Combined assets value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Holdings</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGoldWeight(user?.goldBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(goldValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashValue)}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(goldPrice)}</div>
            <p className="text-xs text-muted-foreground">per gram</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Breakdown & Transactions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Your portfolio breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No assets yet
                </div>
              )}
            </div>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>Gold</span>
                  </div>
                  <span className="font-medium">{goldPercent.toFixed(1)}%</span>
                </div>
                <Progress value={goldPercent} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    <span>Cash</span>
                  </div>
                  <span className="font-medium">{cashPercent.toFixed(1)}%</span>
                </div>
                <Progress value={cashPercent} className="h-2 [&>div]:bg-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <TransactionTable transactions={displayTransactions} />
              </TabsContent>
              <TabsContent value="buy">
                <TransactionTable
                  transactions={displayTransactions.filter((t) => t.type === "BUY")}
                />
              </TabsContent>
              <TabsContent value="sell">
                <TransactionTable
                  transactions={displayTransactions.filter((t) => t.type === "SELL")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TransactionTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {tx.type === "BUY" ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : tx.type === "SELL" ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : (
                  <Banknote className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium">{tx.type}</span>
              </div>
            </TableCell>
            <TableCell>
              {tx.amount > 0 ? formatGoldWeight(tx.amount) : "-"}
            </TableCell>
            <TableCell>
              {tx.pricePerGram > 0 ? formatCurrency(tx.pricePerGram) : "-"}
            </TableCell>
            <TableCell className={tx.type === "BUY" ? "text-green-600" : tx.type === "SELL" ? "text-red-600" : ""}>
              {tx.type === "BUY" ? "-" : tx.type === "SELL" ? "+" : ""}
              {formatCurrency(tx.totalValue)}
            </TableCell>
            <TableCell>
              <Badge
                variant={tx.status === "COMPLETED" ? "default" : "secondary"}
                className={tx.status === "COMPLETED" ? "bg-green-600" : ""}
              >
                {tx.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(tx.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
