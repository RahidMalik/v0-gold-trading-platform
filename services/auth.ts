import { apiClient } from "@/types/apiClient";
import { ApiResponse } from "@/types/api";

export interface RegisterPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    referralCode?: string;
}

export interface RegisterResponse {
    user: {
        id: string;
        name: string;
        email: string;
        referralCode: string;
    };
    message: string;
}

export const authService = {
    register: async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponse>> => {
        return await apiClient.request("/auth/register", {
            method: "POST",
            data: payload,
        });
    },

    sendOtp: async (email: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.request("/auth/forgot-password/send-otp", {
            method: "POST",
            data: { email },
        });
    },
    verifyOtp: async (email: string, otp: string): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.request("/auth/forgot-password/verify-otp", {
            method: "POST",
            data: { email, otp },
        });
    },

    resetPasswordWithOtp: async (
        email: string,
        otp: string,
        newPassword: string
    ): Promise<ApiResponse<{ message: string }>> => {
        return await apiClient.request("/auth/forgot-password/reset", {
            method: "POST",
            data: { email, otp, newPassword },
        });
    },
};