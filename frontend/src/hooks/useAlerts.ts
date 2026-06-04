import { useState, useEffect, useCallback } from "react";
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from "@/lib/storage";
import { Alert } from "@/types/inventory";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAlerts(getAlerts());
    setIsLoading(false);
  }, []);

  const refresh = useCallback(() => {
    setAlerts(getAlerts());
  }, []);

  const markAsRead = useCallback((id: string) => {
    markAlertAsRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllRead = useCallback(() => {
    markAllAlertsAsRead();
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  const criticalCount = alerts.filter(a => a.type === "critical" && !a.read).length;

  return {
    alerts,
    isLoading,
    refresh,
    markAsRead,
    markAllRead,
    unreadCount,
    criticalCount,
  };
}
