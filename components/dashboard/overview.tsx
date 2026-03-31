"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price"
import { GoldPriceChart } from "@/components/dashboard/gold-price-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

interface DashboardOverviewProps {
  user: {
    id: string
    name: string | null
    email: string
    goldBalance: number
    cashBalance: number
  }
}

interface GoldPriceData {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  timestamp: string
  change24h: number
  changePercent24h: number
  history?: Array<{ date: string; price: number }>
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchGoldPrice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/gold/price?history=true&days=30")
      const data = await response.json()
      if (data.success) {
        setGoldPrice(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch gold price:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGoldPrice()
    // Refresh every 60 seconds
    const interval = setInterval(fetchGoldPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  const portfolioValue = goldPrice
    ? user.goldBalance * goldPrice.pricePerGram + user.cashBalance
    : user.cashBalance

  const goldValue = goldPrice ? user.goldBalance * goldPrice.pricePerGram : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your gold investments and market trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchGoldPrice} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/trade">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trade Now
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Gold Price Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Price</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goldPrice ? formatCurrency(goldPrice.pricePerGram) : "Loading..."}
            </div>
            <p className="text-xs text-muted-foreground">per gram</p>
            {goldPrice && (
              <div className={`flex items-center text-xs mt-1 ${
                goldPrice.changePercent24h >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {goldPrice.changePercent24h >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {goldPrice.changePercent24h >= 0 ? "+" : ""}
                {goldPrice.changePercent24h.toFixed(2)}% today
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Value Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">Total assets value</p>
          </CardContent>
        </Card>

        {/* Gold Holdings Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Holdings</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGoldWeight(user.goldBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(goldValue)} value
            </p>
          </CardContent>
        </Card>

        {/* Cash Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user.cashBalance)}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Price Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Gold Price Trend</CardTitle>
            <CardDescription>
              30-day price movement in Indonesian Rupiah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="30d" className="space-y-4">
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
              </TabsList>
              <TabsContent value="7d" className="space-y-4">
                <GoldPriceChart data={goldPrice?.history?.slice(-7) || []} />
              </TabsContent>
              <TabsContent value="30d" className="space-y-4">
                <GoldPriceChart data={goldPrice?.history || []} />
              </TabsContent>
              <TabsContent value="90d" className="space-y-4">
                <GoldPriceChart data={goldPrice?.history || []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/dashboard/trade">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Buy Gold</CardTitle>
                  <CardDescription>Purchase digital gold instantly</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/dashboard/trade">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Sell Gold</CardTitle>
                  <CardDescription>Convert gold to cash balance</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" asChild>
          <Link href="/dashboard/shop">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Physical Gold</CardTitle>
                  <CardDescription>Shop gold bars and jewelry</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  )
}
