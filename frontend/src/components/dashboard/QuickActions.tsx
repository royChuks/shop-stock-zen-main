import { useState } from "react";
import { Plus, QrCode, FileText, TruckIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "@/components/inventory/ProductDialog";
import { useInventory } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/inventory";
import { toast } from "@/components/ui/use-toast";

type AddProductData = Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">;

export function QuickActions() {
  const { addItem } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddProduct = (productData: AddProductData) => {
    addItem(productData);
    setIsAddDialogOpen(false);
    toast({ title: "Product added", description: `${productData.name} has been added to inventory.` });
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common inventory tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-1 lg:grid-cols-2">
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Add Product</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">Create new inventory item</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Scan Barcode</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">Quick stock update</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">New Order</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">Place supplier order</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Generate Report</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">Export inventory data</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Stock Count</span>
          </div>
          <span className="text-xs text-muted-foreground text-left">Start inventory audit</span>
        </Button>
      </div>

      {/* Add Product Dialog */}
      <ProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        mode="add"
      />
    </div>
  );
}
