import { apiClient } from "@/types/apiClient";
import type { ApiResponse } from "@/types/api";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    goldBalance: number;
    cashBalance: number;
    referralCode: string;
    twoFactorEnabled: boolean;
    createdAt: string;
};

export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    image?: string;
};

export const userService = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.request("/user/profile",
            { method: "GET" }
        );
    },
    updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
        return await apiClient.request("/user/profile", {
            method: "PATCH",
            data: payload,
        });
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.request("/user/change-password", {
            method: "POST",
            data: { currentPassword, newPassword },
        });
    },
    updateProfilePhoto: async (file: File): Promise<ApiResponse<{ image: string }>> => {
        const formData = new FormData;
        formData.append("avatar", file);
        return await apiClient.request("/user/update-photo",
            {
                method: "POST",
                data: formData,
            },
        );
    },
    getReferrals: async (): Promise<ApiResponse<any[]>> => {
        return await apiClient.request("/user/referrals", {
            method: "GET"
        });
    },
}
