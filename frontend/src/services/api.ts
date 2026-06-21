import { authService } from "./authService";

const LOCAL_API_URL = "http://localhost:3000/api/v1";
const PRODUCTION_API_URL = "/api/v1";

function resolveApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();

  if (import.meta.env.PROD) {
    if (!configuredUrl || configuredUrl.includes("localhost") || configuredUrl.includes("127.0.0.1")) {
      return PRODUCTION_API_URL;
    }

    return configuredUrl.replace(/\/$/, "");
  }

  return (configuredUrl || LOCAL_API_URL).replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return authService.getToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = "Request failed";
      let errorCode = "UNKNOWN_ERROR";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        errorCode = errorData.error?.code || errorCode;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      const error = new Error(errorMessage) as Error & { status?: number; code?: string };
      error.status = response.status;
      error.code = errorCode;

      if (response.status === 401) {
        authService.logout();
        window.location.href = "/login";
      }

      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
