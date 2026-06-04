import { AlertTriangle, Package, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  icon: typeof AlertTriangle;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Mechanical Keyboard stock critical",
    description: "Only 8 units remaining. Reorder point is 25.",
    time: "2 hours ago",
    icon: AlertTriangle,
  },
  {
    id: "2",
    type: "critical",
    title: "Ergonomic Chair Pro nearly depleted",
    description: "Only 5 units left. Consider expedited reorder.",
    time: "4 hours ago",
    icon: Package,
  },
  {
    id: "3",
    type: "warning",
    title: "USB-C Hub approaching reorder point",
    description: "23 units remaining, reorder point is 30.",
    time: "6 hours ago",
    icon: TrendingDown,
  },
  {
    id: "4",
    type: "info",
    title: "Pending order from TechSupply Co",
    description: "Expected delivery in 3 business days.",
    time: "1 day ago",
    icon: Clock,
  },
];

const alertConfig = {
  critical: {
    bg: "bg-critical/5",
    border: "border-critical/20",
    iconBg: "bg-critical/10",
    iconColor: "text-critical",
  },
  warning: {
    bg: "bg-warning/5",
    border: "border-warning/20",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-primary/5",
    border: "border-primary/20",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
};

export function AlertsPanel() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Stock Alerts</h3>
          <p className="text-sm text-muted-foreground">Items requiring attention</p>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-critical text-xs font-semibold text-critical-foreground">
          {alerts.filter(a => a.type === "critical").length}
        </span>
      </div>

      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          return (
            <div
              key={alert.id}
              className={cn(
                "flex gap-4 p-4 transition-colors hover:bg-muted/20",
                config.bg
              )}
            >
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.iconBg)}>
                <alert.icon className={cn("h-5 w-5", config.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{alert.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{alert.description}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{alert.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-4">
        <button className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View all alerts →
        </button>
      </div>
    </div>
  );
}
