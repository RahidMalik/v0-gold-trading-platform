"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Gem,
  CreditCard,
  Coins,
} from "lucide-react"
import { formatCurrency } from "@/lib/gold-price"
import { toast } from "sonner"

// Demo products
const products = [
  {
    id: "1",
    name: "1 Gram Gold Bar",
    description: "Premium 24K pure gold bar with certificate of authenticity",
    category: "GOLD_BAR",
    weight: 1,
    purity: "24K",
    price: 1250000,
    stock: 50,
    images: ["/images/gold-bar-1g.jpg"],
  },
  {
    id: "2",
    name: "5 Gram Gold Bar",
    description: "Premium 24K pure gold bar, LBMA certified",
    category: "GOLD_BAR",
    weight: 5,
    purity: "24K",
    price: 6150000,
    stock: 25,
    images: ["/images/gold-bar-5g.jpg"],
  },
  {
    id: "3",
    name: "10 Gram Gold Bar",
    description: "Investment grade 24K gold bar with secure packaging",
    category: "GOLD_BAR",
    weight: 10,
    purity: "24K",
    price: 12200000,
    stock: 15,
    images: ["/images/gold-bar-10g.jpg"],
  },
  {
    id: "4",
    name: "25 Gram Gold Bar",
    description: "Premium investment gold bar with serial number",
    category: "GOLD_BAR",
    weight: 25,
    purity: "24K",
    price: 30250000,
    stock: 10,
    images: ["/images/gold-bar-25g.jpg"],
  },
  {
    id: "5",
    name: "Gold Kijang Coin",
    description: "Limited edition gold coin, 1 oz pure gold",
    category: "GOLD_COIN",
    weight: 31.1,
    purity: "24K",
    price: 38500000,
    stock: 8,
    images: ["/images/gold-coin.jpg"],
  },
  {
    id: "6",
    name: "22K Gold Ring",
    description: "Elegant 22K gold ring, 5 grams",
    category: "JEWELRY",
    weight: 5,
    purity: "22K",
    price: 5200000,
    stock: 20,
    images: ["/images/gold-ring.jpg"],
  },
  {
    id: "7",
    name: "22K Gold Necklace",
    description: "Beautiful 22K gold necklace, 10 grams",
    category: "JEWELRY",
    weight: 10,
    purity: "22K",
    price: 10300000,
    stock: 12,
    images: ["/images/gold-necklace.jpg"],
  },
  {
    id: "8",
    name: "Gold Gift Set",
    description: "Premium gift set with 1g gold bar and certificate",
    category: "GIFT_SET",
    weight: 1,
    purity: "24K",
    price: 1450000,
    stock: 30,
    images: ["/images/gift-set.jpg"],
  },
]

interface CartItem {
  product: typeof products[0]
  quantity: number
}

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  // Filter and sort products
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = category === "all" || p.category === category
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "weight":
          return b.weight - a.weight
        default:
          return 0
      }
    })

  // Cart functions
  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const shippingCost = cartTotal > 10000000 ? 0 : 50000
  const grandTotal = cartTotal + shippingCost
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      toast.error("Please fill in all shipping details")
      return
    }

    // Here you would integrate with payment gateway
    toast.success("Order placed successfully! Redirecting to payment...")
    setIsCheckoutOpen(false)
    setCart([])
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "GOLD_BAR":
        return <Package className="h-4 w-4" />
      case "GOLD_COIN":
        return <Coins className="h-4 w-4" />
      case "JEWELRY":
        return <Gem className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">Gold Shop</h1>
          <p className="text-muted-foreground">
            Purchase physical gold products for delivery
          </p>
        </div>

        {/* Cart Button */}
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Shopping Cart</SheetTitle>
              <SheetDescription>
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""} in your cart
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mb-4" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 p-3 rounded-lg border"
                      >
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                          <Gem className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.product.weight}g - {item.product.purity}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="py-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                      </span>
                    </div>
                    {cartTotal < 10000000 && (
                      <p className="text-xs text-muted-foreground">
                        Free shipping on orders over {formatCurrency(10000000)}
                      </p>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                  <SheetFooter>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsCartOpen(false)
                        setIsCheckoutOpen(true)
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </SheetFooter>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="GOLD_BAR">Gold Bars</SelectItem>
                <SelectItem value="GOLD_COIN">Gold Coins</SelectItem>
                <SelectItem value="JEWELRY">Jewelry</SelectItem>
                <SelectItem value="GIFT_SET">Gift Sets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Gem className="h-16 w-16 text-primary/50" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {product.purity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getCategoryIcon(product.category)}
                    <span>{product.weight}g</span>
                    <span className="ml-auto">
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-center gap-6 py-4">
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Gem className="h-10 w-10 text-primary/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant="secondary">{product.purity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{product.weight}g</span>
                      <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(product.price)}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found matching your search
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order by entering shipping details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  value={shippingAddress.name}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, address: e.target.value })
                  }
                  placeholder="Enter full address"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="postalCode">Postal Code</FieldLabel>
                  <Input
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    placeholder="Postal code"
                  />
                </Field>
              </div>
            </FieldGroup>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay {formatCurrency(grandTotal)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
