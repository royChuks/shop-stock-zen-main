import { api } from "./api";
import type { Order } from "@/types/inventory";

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrderRequest {
  supplierId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  orderDate?: string;
  expectedDelivery?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

export const orderApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    supplierId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<OrdersResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<OrdersResponse>(`/orders${query ? `?${query}` : ""}`);
  },

  async getById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async create(data: CreateOrderRequest): Promise<Order> {
    return api.post<Order>("/orders", data);
  },

  async update(id: string, data: UpdateOrderRequest): Promise<Order> {
    return api.put<Order>(`/orders/${id}`, data);
  },

  async updateStatus(id: string, status: UpdateOrderRequest["status"]): Promise<Order> {
    return api.patch<Order>(`/orders/${id}/status`, { status });
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/orders/${id}`);
  },
};