import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
        });

        // --- REQUEST INTERCEPTOR ---
        this.axiosInstance.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => Promise.reject(error)
        );

        // --- RESPONSE INTERCEPTOR ---
        this.axiosInstance.interceptors.response.use(
            (response) => response.data,
            (error) => {
                const status = error.response?.status;

                if (status === 401) {
                    if (typeof window !== "undefined") {
                        console.warn("Session expired. Redirecting...");
                        const currentPath = window.location.pathname;
                        const publicPaths = ["/login", "/register", "/forgot-password"];
                        if (!publicPaths.includes(currentPath)) {
                            window.location.href = `/login?callbackUrl=${currentPath}`;
                        }
                    }
                }

                if (status === 404) {
                    return Promise.resolve({ success: true, data: [], message: "Not found" });
                }

                const message =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message ||
                    "Something went wrong";

                console.error("API_ERROR:", error.response?.data);
                return Promise.reject(new Error(message));
            }
        );
    }

    public async request<T>(
        endpoint: string,
        options: AxiosRequestConfig = {}
    ): Promise<T> {
        return this.axiosInstance({ url: endpoint, ...options });
    }
}

export const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
);