import { useState, useEffect, useCallback } from "react";
import {
  getInventory,
  saveInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  initializeStorage,
} from "@/lib/storage";
import { InventoryItem } from "@/types/inventory";

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    setInventory(getInventory());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setInventory(getInventory());
  }, []);

  const addItem = useCallback((item: Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">) => {
    const newItem = addInventoryItem(item);
    setInventory(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    const updated = updateInventoryItem(id, updates);
    if (updated) {
      setInventory(prev => prev.map(item => item.id === id ? updated : item));
    }
    return updated;
  }, []);

  const deleteItem = useCallback((id: string) => {
    const success = deleteInventoryItem(id);
    if (success) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
    return success;
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    return updateItem(id, { quantity });
  }, [updateItem]);

  const getItemById = useCallback((id: string) => {
    return inventory.find(item => item.id === id);
  }, [inventory]);

  const searchItems = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return inventory.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }, [inventory]);

  const filterByStatus = useCallback((status: InventoryItem["status"] | "all") => {
    if (status === "all") return inventory;
    return inventory.filter(item => item.status === status);
  }, [inventory]);

  const filterByCategory = useCallback((category: string) => {
    if (category === "all") return inventory;
    return inventory.filter(item => item.category === category);
  }, [inventory]);

  const sortItems = useCallback((items: InventoryItem[], sortBy: string, sortOrder: "asc" | "desc" = "asc") => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "status":
          const statusOrder = { critical: 0, low: 1, healthy: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, []);

  return {
    inventory,
    isLoading,
    refresh,
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
    getItemById,
    searchItems,
    filterByStatus,
    filterByCategory,
    sortItems,
  };
}
