export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  price: number;
  cost: number;
  status: "healthy" | "low" | "critical";
  supplier: string;
  supplierId?: string;
  lastUpdated: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  category: string;
  rating: number;
  status: "active" | "inactive";
  totalOrders: number;
  lastOrderDate?: string;
}

export interface Activity {
  id: string;
  type: "stock_update" | "order_placed" | "order_received" | "product_added" | "product_removed" | "low_stock_alert";
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  productId?: string;
}

export type Category = "Electronics" | "Furniture" | "Office" | "Lighting" | "Accessories" | "Other";

export const CATEGORIES: Category[] = ["Electronics", "Furniture", "Office", "Lighting", "Accessories", "Other"];
