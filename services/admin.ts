import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export const adminService = {
    // ── Accounts ──
    getAccounts: async (): Promise<ApiResponse<any[]>> => {
        return await apiClient.request("/admin/accounts", { method: "GET" });
    },

    deleteAccount: async (id: string): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/accounts", {
            method: "DELETE",
            data: { id },
        });
    },

    // ── Users ──
    getUsers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<PaginatedResponse<any>> => {
        return await apiClient.request("/admin/users", { method: "GET", params });
    },

    getUser: async (userId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/users/${userId}`, { method: "GET" });
    },

    updateUser: async (userId: string, data: any): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/users/${userId}`, {
            method: "PATCH",
            data,
        });
    },

    deleteUser: async (userId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/users/${userId}`, {
            method: "DELETE",
        });
    },

    toggleUserStatus: async (
        userId: string,
        isActive: boolean
    ): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/users/${userId}/toggle`, {
            method: "PATCH",
            data: { isActive },
        });
    },

    // ── Transactions ──
    getTransactions: async (params?: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
    }): Promise<PaginatedResponse<any>> => {
        return await apiClient.request("/admin/transactions", {
            method: "GET",
            params,
        });
    },

    // ── Withdrawals ──
    getWithdrawals: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<PaginatedResponse<any>> => {
        return await apiClient.request("/admin/withdrawals", {
            method: "GET",
            params,
        });
    },

    updateWithdrawal: async (
        id: string,
        status: string,
        adminNotes?: string
    ): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/withdrawals", {
            method: "PATCH",
            data: { id, status, adminNotes },
        });
    },

    // ── Products ──
    getProducts: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
    }): Promise<PaginatedResponse<any>> => {
        return await apiClient.request("/admin/products", {
            method: "GET",
            params,
        });
    },

    createProduct: async (data: any): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/products", {
            method: "POST",
            data,
        });
    },

    updateProduct: async (
        productId: string,
        data: any
    ): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/products/${productId}`, {
            method: "PATCH",
            data,
        });
    },

    deleteProduct: async (productId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/products/${productId}`, {
            method: "DELETE",
        });
    },
};