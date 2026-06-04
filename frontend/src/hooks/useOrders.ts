import { useState, useEffect, useCallback } from "react";
import { getOrders, addOrder, updateOrder } from "@/lib/storage";
import { Order } from "@/types/inventory";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setOrders(getOrders());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setOrders(getOrders());
  }, []);

  const addNewOrder = useCallback((order: Omit<Order, "id" | "orderNumber">) => {
    const newOrder = addOrder(order);
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, []);

  const updateOrderStatus = useCallback((id: string, updates: Partial<Order>) => {
    const updated = updateOrder(id, updates);
    if (updated) {
      setOrders(prev => prev.map(order => order.id === id ? updated : order));
    }
    return updated;
  }, []);

  const getOrderById = useCallback((id: string) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const filterByStatus = useCallback((status: Order["status"] | "all") => {
    if (status === "all") return orders;
    return orders.filter(order => order.status === status);
  }, [orders]);

  return {
    orders,
    isLoading,
    refresh,
    addNewOrder,
    updateOrderStatus,
    getOrderById,
    filterByStatus,
  };
}
