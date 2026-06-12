import { api } from "./api";
import type { InventoryItem } from "@/types/inventory";

export interface ProductsResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  reorderPoint: number;
  supplierId?: string;
  description?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export const productApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<ProductsResponse>(`/products${query ? `?${query}` : ""}`);
  },

  async getById(id: string): Promise<InventoryItem> {
    return api.get<InventoryItem>(`/products/${id}`);
  },

  async create(data: CreateProductRequest): Promise<InventoryItem> {
    return api.post<InventoryItem>("/products", data);
  },

  async update(id: string, data: UpdateProductRequest): Promise<InventoryItem> {
    return api.put<InventoryItem>(`/products/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/products/${id}`);
  },

  async bulkUpdateQuantities(items: { productId: string; quantity: number }[]): Promise<{ message: string }> {
    return api.put<{ message: string }>("/products/bulk/quantities", { items });
  },
};