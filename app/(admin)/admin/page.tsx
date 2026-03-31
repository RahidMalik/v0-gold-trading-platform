import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt,
  Network
} from "lucide-react"
import { mockUsers, mockTransactions, mockWithdrawals, mockOrders, mockProducts } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  // Calculate stats
  const totalUsers = mockUsers.filter(u => u.role === "USER").length
  const activeUsers = mockUsers.filter(u => u.isActive && u.role === "USER").length
  const totalGoldTraded = mockTransactions.reduce((sum, t) => 
    t.type === "BUY" || t.type === "SELL" ? sum + t.goldAmount : sum, 0
  )
  const totalVolume = mockTransactions.reduce((sum, t) => sum + t.cashAmount, 0)
  const pendingWithdrawals = mockWithdrawals.filter(w => w.status === "PENDING")
  const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0)
  const totalOrders = mockOrders.length
  const pendingOrders = mockOrders.filter(o => o.status === "PENDING" || o.status === "PROCESSING").length

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      description: `${activeUsers} active users`,
      icon: Users,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Trading Volume",
      value: `$${totalVolume.toLocaleString()}`,
      description: `${totalGoldTraded.toFixed(2)}g gold traded`,
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Pending Withdrawals",
      value: pendingWithdrawals.length.toString(),
      description: `$${pendingWithdrawalAmount.toLocaleString()} total`,
      icon: Receipt,
      trend: pendingWithdrawals.length > 0 ? "Needs attention" : "All clear",
      trendUp: pendingWithdrawals.length === 0,
    },
    {
      title: "Shop Orders",
      value: totalOrders.toString(),
      description: `${pendingOrders} pending`,
      icon: Package,
      trend: "+5%",
      trendUp: true,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the GoldInvest admin panel. Monitor and manage your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{stat.description}</span>
                <span className={`ml-2 flex items-center ${stat.trendUp ? "text-green-600" : "text-amber-600"}`}>
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Withdrawals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Pending Withdrawals
            </CardTitle>
            <CardDescription>
              Withdrawal requests awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingWithdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending withdrawals</p>
            ) : (
              <div className="space-y-3">
                {pendingWithdrawals.slice(0, 5).map((withdrawal) => {
                  const user = mockUsers.find(u => u.id === withdrawal.userId)
                  return (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{user?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.method.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          ${withdrawal.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Trades
            </CardTitle>
            <CardDescription>
              Latest trading activity on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions
                .filter(t => t.type === "BUY" || t.type === "SELL")
                .slice(0, 5)
                .map((tx) => {
                  const user = mockUsers.find(u => u.id === tx.userId)
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          tx.type === "BUY" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "BUY" ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user?.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {tx.type} {tx.goldAmount.toFixed(2)}g
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${tx.cashAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Platform Overview
          </CardTitle>
          <CardDescription>
            Key metrics and platform health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {mockProducts.filter(p => p.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {mockProducts.reduce((sum, p) => sum + p.stock, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Inventory</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {mockUsers.filter(u => u.referredById).length}
              </p>
              <p className="text-sm text-muted-foreground">Referred Users</p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                ${mockOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Shop Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
