import { api } from "./api";
import type { Supplier } from "@/types/inventory";

export interface SuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateSupplierRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export const supplierApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<SuppliersResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return api.get<SuppliersResponse>(`/suppliers${query ? `?${query}` : ""}`);
  },

  async getById(id: string): Promise<Supplier> {
    return api.get<Supplier>(`/suppliers/${id}`);
  },

  async create(data: CreateSupplierRequest): Promise<Supplier> {
    return api.post<Supplier>("/suppliers", data);
  },

  async update(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    return api.put<Supplier>(`/suppliers/${id}`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/suppliers/${id}`);
  },
};