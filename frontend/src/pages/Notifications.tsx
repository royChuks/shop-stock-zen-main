import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/useAlerts";
import { AlertTriangle, Package, Clock, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const iconMap = { critical: AlertTriangle, warning: Package, info: Clock };
const styleMap = {
  critical: "bg-critical/10 text-critical border-critical/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

const Notifications = () => {
  const { alerts, markAsRead, markAllRead, unreadCount } = useAlerts();

  return (
    <DashboardLayout title="Notifications" subtitle="Stay updated with inventory alerts.">
      <div className="flex justify-between items-center mb-6">
        <Badge variant="outline">{unreadCount} unread</Badge>
        <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = iconMap[alert.type];
          return (
            <Card key={alert.id} className={cn("transition-all", !alert.read && "border-l-4 border-l-primary")}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("p-2 rounded-lg", styleMap[alert.type])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={cn("font-medium", alert.read && "text-muted-foreground")}>{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</p>
                </div>
                {!alert.read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
