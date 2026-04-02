import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";

export const adminService = ({
    getAccount: async (): Promise<ApiResponse<any[]>> => {
        return await apiClient.request("/admin/accounts",
            {
                method: "GET"
            }
        )
    },
    deleteAccount: async (id: string): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/accounts",
            {
                method: "DELETE",
                data: { id },
            }
        );
    },
    // Users toggle active
    toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/users/${userId}`,
            {
                method: "PATCH",
                data: { isActive },
            }
        )
    }
})