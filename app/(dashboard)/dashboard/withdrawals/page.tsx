"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  Wallet,
  Banknote,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  ArrowDownToLine,
  Plus,
  AlertCircle,
} from "lucide-react"
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price"
import { toast } from "sonner"

// Demo withdrawals
const demoWithdrawals = [
  {
    id: "1",
    type: "CASH",
    amount: 5000000,
    status: "COMPLETED",
    bankName: "BCA",
    accountNumber: "****4567",
    accountName: "John Doe",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "2",
    type: "PHYSICAL_GOLD",
    amount: 10,
    status: "PROCESSING",
    physicalAddress: {
      name: "John Doe",
      address: "Jl. Sudirman No. 123, Jakarta",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    processedAt: null,
  },
  {
    id: "3",
    type: "CASH",
    amount: 2500000,
    status: "PENDING",
    bankName: "Mandiri",
    accountNumber: "****8901",
    accountName: "John Doe",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    processedAt: null,
  },
  {
    id: "4",
    type: "CASH",
    amount: 1000000,
    status: "REJECTED",
    bankName: "BNI",
    accountNumber: "****2345",
    accountName: "John Doe",
    adminNotes: "Insufficient verification documents",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
]

const statusConfig = {
  PENDING: { label: "Pending", icon: Clock, color: "bg-yellow-500" },
  APPROVED: { label: "Approved", icon: CheckCircle, color: "bg-blue-500" },
  PROCESSING: { label: "Processing", icon: Clock, color: "bg-indigo-500" },
  COMPLETED: { label: "Completed", icon: CheckCircle, color: "bg-green-500" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "bg-red-500" },
}

export default function WithdrawalsPage() {
  const { data: session } = useSession()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [withdrawType, setWithdrawType] = useState<"CASH" | "PHYSICAL_GOLD">("CASH")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  })

  const user = session?.user
  const cashBalance = user?.cashBalance || 0
  const goldBalance = user?.goldBalance || 0

  const pendingWithdrawals = demoWithdrawals.filter(
    (w) => w.status === "PENDING" || w.status === "PROCESSING"
  )
  const completedWithdrawals = demoWithdrawals.filter((w) => w.status === "COMPLETED")
  const totalWithdrawn = completedWithdrawals.reduce(
    (sum, w) => sum + (w.type === "CASH" ? w.amount : 0),
    0
  )

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount)

    if (withdrawType === "CASH") {
      if (!amount || amount < 100000) {
        toast.error("Minimum cash withdrawal is Rp 100,000")
        return
      }
      if (amount > cashBalance) {
        toast.error("Insufficient cash balance")
        return
      }
      if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
        toast.error("Please fill in all bank details")
        return
      }
    } else {
      if (!amount || amount < 1) {
        toast.error("Minimum gold withdrawal is 1 gram")
        return
      }
      if (amount > goldBalance) {
        toast.error("Insufficient gold balance")
        return
      }
      if (!formData.address || !formData.city || !formData.phone) {
        toast.error("Please fill in shipping address")
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Withdrawal request submitted successfully!")
      setIsDialogOpen(false)
      setFormData({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        address: "",
        city: "",
        postalCode: "",
        phone: "",
      })
    } catch {
      toast.error("Failed to submit withdrawal request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return (
      <Badge className={`${config.color} text-white`}>
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Withdrawals</h1>
          <p className="text-muted-foreground">
            Withdraw your cash or convert gold to physical delivery
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Withdrawal
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
            <p className="text-xs text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gold Balance</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatGoldWeight(goldBalance)}</div>
            <p className="text-xs text-muted-foreground">Can convert to physical</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingWithdrawals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWithdrawn)}</div>
            <p className="text-xs text-muted-foreground">Lifetime withdrawals</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Withdrawal Information</p>
            <ul className="text-blue-700 dark:text-blue-300 mt-1 space-y-1">
              <li>Cash withdrawals are processed within 1-2 business days</li>
              <li>Minimum cash withdrawal: Rp 100,000</li>
              <li>Physical gold delivery takes 3-5 business days</li>
              <li>Minimum gold withdrawal: 1 gram</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Track all your withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <WithdrawalList withdrawals={demoWithdrawals} getStatusBadge={getStatusBadge} />
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
              <WithdrawalList
                withdrawals={demoWithdrawals.filter(
                  (w) => w.status === "PENDING" || w.status === "PROCESSING" || w.status === "APPROVED"
                )}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <WithdrawalList
                withdrawals={demoWithdrawals.filter(
                  (w) => w.status === "COMPLETED" || w.status === "REJECTED"
                )}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* New Withdrawal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Withdrawal Request</DialogTitle>
            <DialogDescription>
              Choose withdrawal type and enter details
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={withdrawType}
            onValueChange={(v) => setWithdrawType(v as "CASH" | "PHYSICAL_GOLD")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="CASH">
                <Banknote className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
              <TabsTrigger value="PHYSICAL_GOLD">
                <Coins className="h-4 w-4 mr-2" />
                Physical Gold
              </TabsTrigger>
            </TabsList>

            <TabsContent value="CASH" className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                Available: <span className="font-semibold">{formatCurrency(cashBalance)}</span>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cashAmount">Amount (IDR)</FieldLabel>
                  <Input
                    id="cashAmount"
                    type="number"
                    min="100000"
                    step="1000"
                    placeholder="Minimum Rp 100,000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bankName">Bank Name</FieldLabel>
                  <Select
                    value={formData.bankName}
                    onValueChange={(v) => setFormData({ ...formData, bankName: v })}
                  >
                    <SelectTrigger id="bankName">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BCA">BCA</SelectItem>
                      <SelectItem value="Mandiri">Mandiri</SelectItem>
                      <SelectItem value="BNI">BNI</SelectItem>
                      <SelectItem value="BRI">BRI</SelectItem>
                      <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="accountNumber">Account Number</FieldLabel>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="accountName">Account Holder Name</FieldLabel>
                  <Input
                    id="accountName"
                    placeholder="Name as on bank account"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  />
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="PHYSICAL_GOLD" className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                Available: <span className="font-semibold">{formatGoldWeight(goldBalance)}</span>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="goldAmount">Amount (grams)</FieldLabel>
                  <Input
                    id="goldAmount"
                    type="number"
                    min="1"
                    step="0.001"
                    placeholder="Minimum 1 gram"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="address">Delivery Address</FieldLabel>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="postalCode">Postal Code</FieldLabel>
                    <Input
                      id="postalCode"
                      placeholder="Postal code"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WithdrawalList({
  withdrawals,
  getStatusBadge,
}: {
  withdrawals: typeof demoWithdrawals
  getStatusBadge: (status: string) => React.ReactNode
}) {
  if (withdrawals.length === 0) {
    return (
      <Empty
        title="No withdrawals found"
        description="Your withdrawal requests will appear here"
      />
    )
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => (
        <Card key={withdrawal.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  withdrawal.type === "CASH" ? "bg-green-100 dark:bg-green-900/30" : "bg-primary/10"
                }`}>
                  {withdrawal.type === "CASH" ? (
                    <Banknote className="h-5 w-5 text-green-600" />
                  ) : (
                    <Coins className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {withdrawal.type === "CASH" ? "Cash Withdrawal" : "Physical Gold"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {withdrawal.type === "CASH"
                      ? `${withdrawal.bankName} - ${withdrawal.accountNumber}`
                      : "Delivery to address"}
                  </p>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {withdrawal.type === "CASH"
                      ? formatCurrency(withdrawal.amount)
                      : formatGoldWeight(withdrawal.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(withdrawal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {getStatusBadge(withdrawal.status)}
              </div>
            </div>

            {withdrawal.status === "REJECTED" && withdrawal.adminNotes && (
              <>
                <Separator className="my-3" />
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  <span className="font-medium">Reason:</span> {withdrawal.adminNotes}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
