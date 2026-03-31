"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Users,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  CheckCircle,
  Info,
  Coins,
} from "lucide-react"
import { formatCurrency } from "@/lib/gold-price"
import { toast } from "sonner"

// Demo referral data
const demoReferrals = [
  {
    id: "1",
    name: "John Smith",
    email: "j***@gmail.com",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    level: 1,
    totalEarnings: 575000,
    isActive: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "s***@outlook.com",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    level: 1,
    totalEarnings: 345000,
    isActive: true,
  },
  {
    id: "3",
    name: "Mike Brown",
    email: "m***@yahoo.com",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    level: 2,
    totalEarnings: 115000,
    isActive: true,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "e***@gmail.com",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    level: 2,
    totalEarnings: 57500,
    isActive: false,
  },
  {
    id: "5",
    name: "Alex Wilson",
    email: "a***@hotmail.com",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    level: 3,
    totalEarnings: 23000,
    isActive: true,
  },
]

const demoEarnings = [
  {
    id: "1",
    fromUser: "John Smith",
    level: 1,
    transactionType: "BUY",
    amount: 287500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "2",
    fromUser: "Sarah Johnson",
    level: 1,
    transactionType: "SELL",
    amount: 172500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "3",
    fromUser: "Mike Brown",
    level: 2,
    transactionType: "BUY",
    amount: 57500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "4",
    fromUser: "Emily Davis",
    level: 2,
    transactionType: "BUY",
    amount: 34500,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

export default function ReferralsPage() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  const referralCode = session?.user?.referralCode || "GLDXXXXXX"
  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${referralCode}`

  const totalEarnings = demoReferrals.reduce((sum, r) => sum + r.totalEarnings, 0)
  const level1Count = demoReferrals.filter((r) => r.level === 1).length
  const level2Count = demoReferrals.filter((r) => r.level === 2).length
  const level3Count = demoReferrals.filter((r) => r.level === 3).length

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join GoldInvest",
        text: "Start your gold investment journey with GoldInvest!",
        url: referralLink,
      })
    } else {
      copyToClipboard(referralLink)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Referral Program</h1>
        <p className="text-muted-foreground">
          Invite friends and earn commissions on their trades
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Your Referral Code</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-background rounded-lg border p-3 font-mono text-2xl font-bold text-primary tracking-wider">
                  {referralCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(referralCode)}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-background text-sm"
                />
                <Button onClick={shareReferral}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="lg:border-l lg:pl-6 space-y-4">
              <h3 className="font-semibold">Commission Structure</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm text-muted-foreground">Level 1 (Direct)</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">5%</Badge>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm text-muted-foreground">Level 2</span>
                  <Badge variant="secondary">3%</Badge>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm text-muted-foreground">Level 3</span>
                  <Badge variant="secondary">2%</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">From all referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              {demoReferrals.filter((r) => r.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(552000)}</div>
            <p className="text-xs text-green-600">+23% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Size</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-lg font-bold">{level1Count}</span>
                <span className="text-xs text-muted-foreground ml-1">L1</span>
              </div>
              <div>
                <span className="text-lg font-bold">{level2Count}</span>
                <span className="text-xs text-muted-foreground ml-1">L2</span>
              </div>
              <div>
                <span className="text-lg font-bold">{level3Count}</span>
                <span className="text-xs text-muted-foreground ml-1">L3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Commission from your referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{earning.fromUser}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {earning.level} - {earning.transactionType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      +{formatCurrency(earning.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(earning.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Network Overview</CardTitle>
            <CardDescription>Your referral network distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary">Level 1</Badge>
                    <span className="text-sm font-medium">{level1Count} referrals</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Direct referrals earn you 5% commission</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm text-muted-foreground">5% commission</span>
                </div>
                <Progress value={(level1Count / 10) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Level 2</Badge>
                    <span className="text-sm font-medium">{level2Count} referrals</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{"Referrals of your referrals earn you 3%"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm text-muted-foreground">3% commission</span>
                </div>
                <Progress value={(level2Count / 20) * 100} className="h-2 [&>div]:bg-muted-foreground" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level 3</Badge>
                    <span className="text-sm font-medium">{level3Count} referrals</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Third level referrals earn you 2%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <span className="text-sm text-muted-foreground">2% commission</span>
                </div>
                <Progress value={(level3Count / 30) * 100} className="h-2 [&>div]:bg-muted-foreground/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Referrals</CardTitle>
          <CardDescription>People who joined using your referral code</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        referral.level === 1
                          ? "default"
                          : referral.level === 2
                          ? "secondary"
                          : "outline"
                      }
                    >
                      Level {referral.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(referral.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={referral.isActive ? "default" : "secondary"}
                      className={referral.isActive ? "bg-green-600" : ""}
                    >
                      {referral.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-primary">
                    {formatCurrency(referral.totalEarnings)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
