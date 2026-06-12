import { api } from "./api";

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalInventoryValue: number;
  totalOrders: number;
  pendingOrders: number;
  totalSuppliers: number;
  recentActivities: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }>;
}

export interface InventoryTrend {
  date: string;
  changes: number;
}

export interface SalesData {
  month: string;
  total: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface SalesResponse {
  sales: SalesData[];
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
}

export const analyticsApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await api.get<DashboardStats>("/analytics/dashboard");
    } catch {
      return {
        totalProducts: 0,
        lowStockItems: 0,
        totalInventoryValue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalSuppliers: 0,
        recentActivities: [],
      };
    }
  },

  async getInventoryTrend(): Promise<InventoryTrend[]> {
    try {
      return await api.get<InventoryTrend[]>("/analytics/inventory-trend");
    } catch {
      return [];
    }
  },

  async getSales(period?: string): Promise<SalesResponse> {
    try {
      const query = period ? `?period=${period}` : "";
      return await api.get<SalesResponse>(`/analytics/sales${query}`);
    } catch {
      return { sales: [], totalRevenue: 0, averageOrderValue: 0, orderCount: 0 };
    }
  },

  async getTopProducts(limit?: number): Promise<TopProduct[]> {
    try {
      const query = limit ? `?limit=${limit}` : "";
      return await api.get<TopProduct[]>(`/analytics/top-products${query}`);
    } catch {
      return [];
    }
  },

  async downloadInventoryReport(): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/analytics/reports/inventory`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    });
    return response.blob();
  },

  async downloadLowStockReport(): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/analytics/reports/low-stock`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    });
    return response.blob();
  },

  async downloadOrdersReport(): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/analytics/reports/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    });
    return response.blob();
  },

  async downloadFinancialReport(): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/analytics/reports/financial`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
    });
    return response.blob();
  },
};