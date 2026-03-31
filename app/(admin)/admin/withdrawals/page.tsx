"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertCircle
} from "lucide-react"
import { mockWithdrawals, mockUsers } from "@/lib/mock-data"
import { toast } from "sonner"

type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING" | "COMPLETED"

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<typeof mockWithdrawals[0] | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const pendingWithdrawals = withdrawals.filter(w => w.status === "PENDING")
  const processingWithdrawals = withdrawals.filter(w => w.status === "PROCESSING" || w.status === "APPROVED")
  const completedWithdrawals = withdrawals.filter(w => w.status === "COMPLETED")
  const rejectedWithdrawals = withdrawals.filter(w => w.status === "REJECTED")

  const handleAction = () => {
    if (!selectedWithdrawal || !actionType) return

    const newStatus: WithdrawalStatus = actionType === "approve" ? "APPROVED" : "REJECTED"
    
    setWithdrawals(prev =>
      prev.map(w =>
        w.id === selectedWithdrawal.id
          ? { ...w, status: newStatus, adminNotes, processedAt: new Date() }
          : w
      )
    )

    toast.success(`Withdrawal ${actionType === "approve" ? "approved" : "rejected"} successfully`)
    setSelectedWithdrawal(null)
    setActionType(null)
    setAdminNotes("")
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      PENDING: { variant: "secondary", icon: <Clock className="mr-1 h-3 w-3" /> },
      APPROVED: { variant: "default", icon: <CheckCircle className="mr-1 h-3 w-3" /> },
      PROCESSING: { variant: "outline", icon: <AlertCircle className="mr-1 h-3 w-3" /> },
      COMPLETED: { variant: "default", icon: <CheckCircle className="mr-1 h-3 w-3" /> },
      REJECTED: { variant: "destructive", icon: <XCircle className="mr-1 h-3 w-3" /> },
    }
    const config = variants[status] || variants.PENDING
    return (
      <Badge variant={config.variant} className="flex w-fit items-center">
        {config.icon}
        {status}
      </Badge>
    )
  }

  const WithdrawalTable = ({ data }: { data: typeof withdrawals }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No withdrawals found
            </TableCell>
          </TableRow>
        ) : (
          data.map((withdrawal) => {
            const user = mockUsers.find(u => u.id === withdrawal.userId)
            return (
              <TableRow key={withdrawal.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-primary">
                  ${withdrawal.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {withdrawal.method.replace("_", " ")}
                </TableCell>
                <TableCell>
                  {getStatusBadge(withdrawal.status)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(withdrawal.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {withdrawal.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setActionType("approve")
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal)
                          setActionType("reject")
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Withdrawal Management</h1>
        <p className="text-muted-foreground">
          Review and process user withdrawal requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingWithdrawals.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processingWithdrawals.length}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedWithdrawals.length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            Manage all withdrawal requests across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Processing ({processingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedWithdrawals.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <WithdrawalTable data={pendingWithdrawals} />
            </TabsContent>
            <TabsContent value="processing" className="mt-4">
              <WithdrawalTable data={processingWithdrawals} />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <WithdrawalTable data={completedWithdrawals} />
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              <WithdrawalTable data={rejectedWithdrawals} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedWithdrawal && !!actionType} onOpenChange={() => {
        setSelectedWithdrawal(null)
        setActionType(null)
        setAdminNotes("")
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Withdrawal
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirm approval of this withdrawal request"
                : "Provide a reason for rejecting this withdrawal"}
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">${selectedWithdrawal.amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">Method:</span>
                  <span>{selectedWithdrawal.method.replace("_", " ")}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder={actionType === "reject" ? "Reason for rejection..." : "Optional notes..."}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedWithdrawal(null)
              setActionType(null)
              setAdminNotes("")
            }}>
              Cancel
            </Button>
            <Button
              variant={actionType === "reject" ? "destructive" : "default"}
              onClick={handleAction}
            >
              {actionType === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
