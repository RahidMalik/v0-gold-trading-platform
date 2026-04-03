"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  RefreshCw,
  Info,
} from "lucide-react";
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price";
import { GoldPriceChart } from "@/components/dashboard/gold-price-chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { transactionService, goldPriceService } from "@/services";

interface GoldPriceData {
  pricePerGram: number;
  currency: string;
  change24h: number;
  changePercent24h: number;
  history?: Array<{ date: string; price: number }>;
}

export default function TradePage() {
  const { data: session, update } = useSession();
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrading, setIsTrading] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [buySlider, setBuySlider] = useState([0]);
  const [sellSlider, setSellSlider] = useState([0]);

  const user = session?.user;

  const fetchGoldPrice = async () => {
    setIsLoading(true);
    try {
      const data = await goldPriceService.getCurrent();
      if (data) setGoldPrice(data as any);
    } catch (error) {
      console.error("Failed to fetch gold price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();
    const interval = setInterval(fetchGoldPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate values
  const buyGrams = buyAmount ? parseFloat(buyAmount) : 0;
  const buyTotal = goldPrice ? buyGrams * goldPrice.pricePerGram : 0;
  const buyFee = buyTotal * 0.005; // 0.5% fee
  const buyGrandTotal = buyTotal + buyFee;

  const sellGrams = sellAmount ? parseFloat(sellAmount) : 0;
  const sellTotal = goldPrice ? sellGrams * goldPrice.pricePerGram : 0;
  const sellFee = sellTotal * 0.005;
  const sellNet = sellTotal - sellFee;

  // Handle slider changes
  const handleBuySlider = (value: number[]) => {
    setBuySlider(value);
    if (goldPrice && user) {
      const maxGrams = user.cashBalance / goldPrice.pricePerGram;
      const grams = (value[0] / 100) * maxGrams;
      setBuyAmount(grams > 0 ? grams.toFixed(4) : "");
    }
  };

  const handleSellSlider = (value: number[]) => {
    setSellSlider(value);
    if (user) {
      const grams = (value[0] / 100) * user.goldBalance;
      setSellAmount(grams > 0 ? grams.toFixed(4) : "");
    }
  };

  // Handle trades
  const handleBuy = async () => {
    if (!buyGrams || buyGrams <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!user || buyGrandTotal > user.cashBalance) {
      toast.error("Insufficient cash balance");
      return;
    }

    setIsTrading(true);
    try {
      await transactionService.buyGold(buyGrams);
      toast.success(
        `Successfully purchased ${formatGoldWeight(buyGrams)} gold!`,
      );
      setBuyAmount("");
      setBuySlider([0]);
      await update();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setIsTrading(false);
    }
  };

  const handleSell = async () => {
    if (!sellGrams || sellGrams <= 0)
      return toast.error("Please enter a valid amount");
    if (!user || sellGrams > user.goldBalance)
      return toast.error("Insufficient gold balance");

    setIsTrading(true);
    try {
      await transactionService.sellGold(sellGrams);
      toast.success(`Successfully sold ${formatGoldWeight(sellGrams)} gold!`);
      setSellAmount("");
      setSellSlider([0]);
      await update();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setIsTrading(false);
    }
  };

  const quickBuyAmounts = [1, 2, 5, 10];
  const quickSellPercents = [25, 50, 75, 100];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Trade Gold
          </h1>
          <p className="text-muted-foreground">
            Buy and sell digital gold at real-time market prices
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchGoldPrice}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Price
        </Button>
      </div>

      {/* Live Price Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Gold Price</p>
              <p className="text-2xl font-bold">
                {goldPrice
                  ? formatCurrency(goldPrice.pricePerGram)
                  : "Loading..."}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  /gram
                </span>
              </p>
            </div>
          </div>
          {goldPrice && (
            <div
              className={`flex items-center gap-2 ${
                goldPrice.changePercent24h >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {goldPrice.changePercent24h >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {goldPrice.changePercent24h >= 0 ? "+" : ""}
                  {goldPrice.changePercent24h.toFixed(2)}%
                </p>
                <p className="text-xs">24h change</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trading Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Trade</CardTitle>
              <CardDescription>Buy or sell gold instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="buy" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="buy"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Buy Gold
                  </TabsTrigger>
                  <TabsTrigger
                    value="sell"
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white"
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Sell Gold
                  </TabsTrigger>
                </TabsList>

                {/* Buy Tab */}
                <TabsContent value="buy" className="space-y-6">
                  <FieldGroup>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Available:{" "}
                        <span className="font-medium text-foreground">
                          {formatCurrency(user?.cashBalance || 0)}
                        </span>
                      </p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="buyAmount">
                        Amount (grams)
                      </FieldLabel>
                      <Input
                        id="buyAmount"
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="Enter gold amount"
                        value={buyAmount}
                        onChange={(e) => {
                          setBuyAmount(e.target.value);
                          if (goldPrice && user) {
                            const maxGrams =
                              user.cashBalance / goldPrice.pricePerGram;
                            const percent =
                              (parseFloat(e.target.value) / maxGrams) * 100;
                            setBuySlider([Math.min(percent, 100)]);
                          }
                        }}
                      />
                    </Field>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <Slider
                        value={buySlider}
                        onValueChange={handleBuySlider}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickBuyAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setBuyAmount(amount.toString())}
                        >
                          {amount}g
                        </Button>
                      ))}
                    </div>
                  </FieldGroup>

                  {/* Buy Summary */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(buyTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Fee (0.5%)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Trading fee charged per transaction</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>{formatCurrency(buyFee)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">
                        {formatCurrency(buyGrandTotal)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={handleBuy}
                    disabled={
                      isTrading ||
                      !buyGrams ||
                      buyGrandTotal > (user?.cashBalance || 0)
                    }
                  >
                    {isTrading ? <Spinner className="mr-2" /> : null}
                    {isTrading
                      ? "Processing..."
                      : `Buy ${buyGrams ? formatGoldWeight(buyGrams) : "Gold"}`}
                  </Button>
                </TabsContent>

                {/* Sell Tab */}
                <TabsContent value="sell" className="space-y-6">
                  <FieldGroup>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Available:{" "}
                        <span className="font-medium text-foreground">
                          {formatGoldWeight(user?.goldBalance || 0)}
                        </span>
                      </p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="sellAmount">
                        Amount (grams)
                      </FieldLabel>
                      <Input
                        id="sellAmount"
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder="Enter gold amount"
                        value={sellAmount}
                        onChange={(e) => {
                          setSellAmount(e.target.value);
                          if (user) {
                            const percent =
                              (parseFloat(e.target.value) / user.goldBalance) *
                              100;
                            setSellSlider([Math.min(percent, 100)]);
                          }
                        }}
                      />
                    </Field>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <Slider
                        value={sellSlider}
                        onValueChange={handleSellSlider}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickSellPercents.map((percent) => (
                        <Button
                          key={percent}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (user) {
                              const grams = (percent / 100) * user.goldBalance;
                              setSellAmount(grams.toFixed(4));
                              setSellSlider([percent]);
                            }
                          }}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                  </FieldGroup>

                  {/* Sell Summary */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(sellTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Fee (0.5%)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Trading fee charged per transaction</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span>-{formatCurrency(sellFee)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-semibold">
                      <span>You receive</span>
                      <span className="text-red-600">
                        {formatCurrency(sellNet)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    size="lg"
                    onClick={handleSell}
                    disabled={
                      isTrading ||
                      !sellGrams ||
                      sellGrams > (user?.goldBalance || 0)
                    }
                  >
                    {isTrading ? <Spinner className="mr-2" /> : null}
                    {isTrading
                      ? "Processing..."
                      : `Sell ${sellGrams ? formatGoldWeight(sellGrams) : "Gold"}`}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Price Chart */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Price Chart</CardTitle>
              <CardDescription>30-day trend</CardDescription>
            </CardHeader>
            <CardContent>
              <GoldPriceChart data={goldPrice?.history || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trading Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
              >
                <TrendingUp className="h-5 w-5" />
              </Badge>
              <div>
                <p className="font-medium">Instant Execution</p>
                <p className="text-sm text-muted-foreground">
                  Trades execute immediately at market price
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
              >
                <Coins className="h-5 w-5" />
              </Badge>
              <div>
                <p className="font-medium">Low Fees</p>
                <p className="text-sm text-muted-foreground">
                  Only 0.5% fee per transaction
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5" />
              </Badge>
              <div>
                <p className="font-medium">Real-time Prices</p>
                <p className="text-sm text-muted-foreground">
                  Updated every 60 seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
