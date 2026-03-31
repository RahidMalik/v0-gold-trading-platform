"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Empty } from "@/components/ui/empty"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Gem,
  MapPin,
} from "lucide-react"
import { formatCurrency } from "@/lib/gold-price"

// Demo orders
const demoOrders = [
  {
    id: "1",
    orderNumber: "ORD-2026-001234",
    status: "DELIVERED",
    paymentStatus: "PAID",
    subtotal: 12200000,
    shippingCost: 0,
    total: 12200000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    trackingNumber: "JNE123456789",
    shippingAddress: {
      name: "John Doe",
      phone: "+62812345678",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      postalCode: "12190",
    },
    items: [
      {
        id: "1",
        name: "10 Gram Gold Bar",
        quantity: 1,
        price: 12200000,
        weight: 10,
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2026-001235",
    status: "SHIPPED",
    paymentStatus: "PAID",
    subtotal: 6150000,
    shippingCost: 50000,
    total: 6200000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    trackingNumber: "JNE987654321",
    shippingAddress: {
      name: "John Doe",
      phone: "+62812345678",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      postalCode: "12190",
    },
    items: [
      {
        id: "2",
        name: "5 Gram Gold Bar",
        quantity: 1,
        price: 6150000,
        weight: 5,
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-2026-001236",
    status: "PROCESSING",
    paymentStatus: "PAID",
    subtotal: 2500000,
    shippingCost: 50000,
    total: 2550000,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    trackingNumber: null,
    shippingAddress: {
      name: "John Doe",
      phone: "+62812345678",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      postalCode: "12190",
    },
    items: [
      {
        id: "3",
        name: "1 Gram Gold Bar",
        quantity: 2,
        price: 1250000,
        weight: 1,
      },
    ],
  },
  {
    id: "4",
    orderNumber: "ORD-2026-001237",
    status: "PENDING",
    paymentStatus: "PENDING",
    subtotal: 30250000,
    shippingCost: 0,
    total: 30250000,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    trackingNumber: null,
    shippingAddress: {
      name: "John Doe",
      phone: "+62812345678",
      address: "Jl. Sudirman No. 123",
      city: "Jakarta",
      postalCode: "12190",
    },
    items: [
      {
        id: "4",
        name: "25 Gram Gold Bar",
        quantity: 1,
        price: 30250000,
        weight: 25,
      },
    ],
  },
]

type Order = typeof demoOrders[0]

const statusConfig = {
  PENDING: { label: "Pending Payment", icon: Clock, color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmed", icon: CheckCircle, color: "bg-blue-500" },
  PROCESSING: { label: "Processing", icon: Package, color: "bg-indigo-500" },
  SHIPPED: { label: "Shipped", icon: Truck, color: "bg-purple-500" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "bg-green-500" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "bg-red-500" },
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filter, setFilter] = useState("all")

  const filteredOrders = demoOrders.filter((order) => {
    if (filter === "all") return true
    if (filter === "active") return ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status)
    if (filter === "completed") return order.status === "DELIVERED"
    if (filter === "cancelled") return order.status === "CANCELLED"
    return true
  })

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">My Orders</h1>
        <p className="text-muted-foreground">
          Track and manage your gold purchases
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{demoOrders.length}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {demoOrders.filter((o) => ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {demoOrders.filter((o) => o.status === "DELIVERED").length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(demoOrders.reduce((sum, o) => sum + o.total, 0))}
            </div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View and track all your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Empty
                  title="No orders found"
                  description="Start shopping to see your orders here"
                />
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{order.orderNumber}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              {new Date(order.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                            {order.trackingNumber && (
                              <span className="text-primary">
                                Tracking: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                              >
                                <Gem className="h-5 w-5 text-primary/50" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.paymentStatus === "PAID" ? "Paid" : "Awaiting Payment"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Tracking */}
              {selectedOrder.trackingNumber && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Tracking Number:</span>
                    <span className="font-mono font-semibold">
                      {selectedOrder.trackingNumber}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Items */}
              <div>
                <p className="text-sm font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg border"
                    >
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <Gem className="h-5 w-5 text-primary/50" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.weight}g x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <p className="text-sm font-medium mb-2">Shipping Address</p>
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.phone}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.address}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {selectedOrder.shippingCost === 0
                      ? "Free"
                      : formatCurrency(selectedOrder.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
