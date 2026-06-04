import { Package, ArrowDownToLine, ArrowUpFromLine, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "stock_in" | "stock_out" | "alert" | "order_complete";
  title: string;
  details: string;
  time: string;
}

const activities: Activity[] = [
  { id: "1", type: "stock_in", title: "Stock received", details: "50 units of Wireless Mouse Pro", time: "10 min ago" },
  { id: "2", type: "stock_out", title: "Stock sold", details: "12 units of USB-C Hub 7-in-1", time: "25 min ago" },
  { id: "3", type: "alert", title: "Low stock alert", details: "Webcam 4K Ultra below threshold", time: "1 hour ago" },
  { id: "4", type: "order_complete", title: "Order delivered", details: "PO-2024-0892 from TechSupply Co", time: "2 hours ago" },
  { id: "5", type: "stock_out", title: "Stock sold", details: "3 units of Ergonomic Chair Pro", time: "3 hours ago" },
  { id: "6", type: "stock_in", title: "Stock received", details: "100 units of Desk Organizer Set", time: "5 hours ago" },
];

const activityConfig = {
  stock_in: { icon: ArrowDownToLine, color: "text-success", bg: "bg-success/10" },
  stock_out: { icon: ArrowUpFromLine, color: "text-primary", bg: "bg-primary/10" },
  alert: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  order_complete: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest inventory movements</p>
      </div>

      <div className="divide-y divide-border">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.bg)}>
                <config.icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-4">
        <button className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}
