import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
};

export interface CreateOrderPayload {
    items: { productId: string; quantity: number }[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
};

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentStatus: string;
    trackingNumber?: string;
    items: any[];
    createdAt: string;
};

export const orderService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        status?: OrderStatus;
    }): Promise<PaginatedResponse<Order>> => {
        return await apiClient.request("/orders", { method: "GET", params });
    },
    getById: async (id: string): Promise<ApiResponse<Order>> => {
        return await apiClient.request(`/orders/${id}`, { method: "GET" });
    },
    create: async (payload: CreateOrderPayload): Promise<ApiResponse<Order>> => {
        return await apiClient.request("/orders", {
            method: "POST",
            data: payload,
        });
    },

    cancel: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.request(`/orders/${id}/cancel`, { method: "PATCH" });
    },
};
