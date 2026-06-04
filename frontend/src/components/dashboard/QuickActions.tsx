import { Plus, QrCode, FileText, TruckIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { icon: Plus, label: "Add Product", description: "Create new inventory item" },
  { icon: QrCode, label: "Scan Barcode", description: "Quick stock update" },
  { icon: TruckIcon, label: "New Order", description: "Place supplier order" },
  { icon: FileText, label: "Generate Report", description: "Export inventory data" },
  { icon: RefreshCw, label: "Stock Count", description: "Start inventory audit" },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common inventory tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-1 lg:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2">
              <action.icon className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{action.label}</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">{action.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
