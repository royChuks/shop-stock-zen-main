import { useState, useEffect } from "react";
import { getActivities } from "@/lib/storage";
import { Activity } from "@/types/inventory";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setActivities(getActivities());
    setIsLoading(false);
  }, []);

  const refresh = () => {
    setActivities(getActivities());
  };

  return {
    activities,
    isLoading,
    refresh,
  };
}
