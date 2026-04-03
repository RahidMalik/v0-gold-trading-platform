import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type TransactionType = "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "REFERRAL_BONUS" | "ASSISTANT_PROFIT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface Transaction {
    id: string
    type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "REFERRAL_BONUS" | "ASSISTANT_PROFIT"
    amount: number          // gold grams
    pricePerGram: number
    totalValue: number
    fee: number
    status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
    isAssistantTrade: boolean
    createdAt: string
}

export const transactionService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        type?: TransactionType;
        status?: TransactionStatus;
    }): Promise<PaginatedResponse<Transaction>> => {
        return await apiClient.request("/transactions",
            {
                method: "POST",
                params,
            }
        );
    },
    getById: async (id: string): Promise<ApiResponse<Transaction>> => {
        return await apiClient.request(`/transactions/${id}`,
            {
                method: "GET"
            }
        );
    },
    buyGold: async (amount: number): Promise<ApiResponse<Transaction>> => {
        return await apiClient.request("/transactions/buy", {
            method: "POST",
            data: { amount },
        });
    },
    sellGold: async (amount: number): Promise<ApiResponse<Transaction>> => {
        return await apiClient.request("/transactions/sell",
            {
                method: "POST",
                data: { amount },
            },
        );
    }
};