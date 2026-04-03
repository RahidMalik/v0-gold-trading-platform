"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Gift, Bot } from "lucide-react";
import { formatCurrency, formatGoldWeight } from "@/lib/gold-price";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { transactionService } from "@/services";
import { Spinner } from "@/components/ui/spinner";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "BUY":
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    case "SELL":
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    case "REFERRAL_BONUS":
      return <Gift className="h-4 w-4 text-primary" />;
    case "ASSISTANT_PROFIT":
      return <Bot className="h-4 w-4 text-blue-600" />;
    default:
      return <ArrowUpRight className="h-4 w-4" />;
  }
};

const getTransactionLabel = (type: string) => {
  switch (type) {
    case "BUY":
      return "Gold Purchase";
    case "SELL":
      return "Gold Sale";
    case "REFERRAL_BONUS":
      return "Referral Bonus";
    case "ASSISTANT_PROFIT":
      return "AI Assistant Profit";
    default:
      return type;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await transactionService.getAll({ limit: 5 });
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No transactions yet</EmptyTitle>
        <EmptyDescription>
          Start trading to see your activity here
        </EmptyDescription>
      </Empty>
    );
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
            <p
              className={`text-sm font-medium ${
                tx.type === "SELL" ? "text-red-600" : "text-green-600"
              }`}
            >
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
  );
}
