import { apiClient } from "@/types/apiClient";
import type { ApiResponse } from "@/types/api";

export interface GoldPrice {
    id: string;
    pricePerGram: number;
    currency: string;
    source: string;
    createdAt: string;
}

export const goldPriceService = {
    getCurrent: async (): Promise<ApiResponse<GoldPrice>> => {
        return await apiClient.request("/gold-price/current", { method: "GET" });
    },

    getHistory: async (params?: { days?: number }): Promise<ApiResponse<GoldPrice[]>> => {
        return await apiClient.request("/gold-price/history", { method: "GET", params });
    },
};