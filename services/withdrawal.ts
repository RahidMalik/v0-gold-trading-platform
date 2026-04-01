import { apiClient } from "@/types/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type WithdrawalType = "CASH" | "PHYSICAL_GOLD";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface CashWithdrawalPayload {
    type: "CASH";
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface GoldWithdrawalPayload {
    type: "PHYSICAL_GOLD";
    amount: number;
    physicalAddress: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
    };
}

export interface Withdrawal {
    id: string;
    type: WithdrawalType;
    amount: number;
    status: WithdrawalStatus;
    createdAt: string;
}

export const withdrawalService = {
    getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Withdrawal>> => {
        return await apiClient.request("/withdrawals", { method: "GET", params });
    },

    create: async (
        payload: CashWithdrawalPayload | GoldWithdrawalPayload
    ): Promise<ApiResponse<Withdrawal>> => {
        return await apiClient.request("/withdrawals", {
            method: "POST",
            data: payload,
        });
    },
};