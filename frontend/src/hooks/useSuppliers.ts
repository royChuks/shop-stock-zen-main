import { useState, useEffect, useCallback } from "react";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from "@/lib/storage";
import { Supplier } from "@/types/inventory";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSuppliers(getSuppliers());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setSuppliers(getSuppliers());
  }, []);

  const addNewSupplier = useCallback((supplier: Omit<Supplier, "id" | "totalOrders">) => {
    const newSupplier = addSupplier(supplier);
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateExistingSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    const updated = updateSupplier(id, updates);
    if (updated) {
      setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
    }
    return updated;
  }, []);

  const removeSupplier = useCallback((id: string) => {
    const success = deleteSupplier(id);
    if (success) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
    return success;
  }, []);

  const getSupplierById = useCallback((id: string) => {
    return suppliers.find(s => s.id === id);
  }, [suppliers]);

  const searchSuppliers = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email.toLowerCase().includes(lowerQuery) ||
      s.category.toLowerCase().includes(lowerQuery)
    );
  }, [suppliers]);

  return {
    suppliers,
    isLoading,
    refresh,
    addNewSupplier,
    updateExistingSupplier,
    removeSupplier,
    getSupplierById,
    searchSuppliers,
  };
}
