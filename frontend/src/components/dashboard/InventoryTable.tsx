import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  price: number;
  status: "healthy" | "low" | "critical";
}

const inventoryData: InventoryItem[] = [
  { id: "1", name: "Wireless Mouse Pro", sku: "WMP-001", category: "Electronics", quantity: 145, reorderPoint: 50, price: 29.99, status: "healthy" },
  { id: "2", name: "USB-C Hub 7-in-1", sku: "UCH-007", category: "Electronics", quantity: 23, reorderPoint: 30, price: 49.99, status: "low" },
  { id: "3", name: "Mechanical Keyboard", sku: "MKB-102", category: "Electronics", quantity: 8, reorderPoint: 25, price: 89.99, status: "critical" },
  { id: "4", name: "Monitor Stand Deluxe", sku: "MSD-045", category: "Furniture", quantity: 67, reorderPoint: 20, price: 39.99, status: "healthy" },
  { id: "5", name: "Webcam 4K Ultra", sku: "WCU-400", category: "Electronics", quantity: 12, reorderPoint: 15, price: 129.99, status: "low" },
  { id: "6", name: "Desk Organizer Set", sku: "DOS-010", category: "Office", quantity: 89, reorderPoint: 30, price: 24.99, status: "healthy" },
  { id: "7", name: "Ergonomic Chair Pro", sku: "ECP-220", category: "Furniture", quantity: 5, reorderPoint: 10, price: 299.99, status: "critical" },
  { id: "8", name: "LED Desk Lamp", sku: "LDL-055", category: "Lighting", quantity: 156, reorderPoint: 40, price: 34.99, status: "healthy" },
];

const statusConfig = {
  healthy: { label: "In Stock", className: "status-healthy" },
  low: { label: "Low Stock", className: "status-low" },
  critical: { label: "Critical", className: "status-critical" },
};

export function InventoryTable() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Inventory Items</h3>
          <p className="text-sm text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Reorder Point</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inventoryData.map((item) => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-4">
                  <span className="font-medium text-foreground">{item.name}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-muted-foreground">{item.sku}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={cn(
                    "font-semibold",
                    item.status === "critical" ? "text-critical" : 
                    item.status === "low" ? "text-warning" : "text-foreground"
                  )}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm text-muted-foreground">{item.reorderPoint}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="font-medium text-foreground">${item.price.toFixed(2)}</span>
                </td>
                <td className="px-4 py-4">
                  <Badge 
                    variant="outline" 
                    className={cn("font-medium", statusConfig[item.status].className)}
                  >
                    {statusConfig[item.status].label}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">Showing 8 of 248 items</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
