import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InventoryTableFull } from "@/components/inventory/InventoryTableFull";
import { ProductDialog } from "@/components/inventory/ProductDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Plus } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { CATEGORIES } from "@/types/inventory";
import { toast } from "@/components/ui/use-toast";

const Inventory = () => {
  const { addItem, inventory } = useInventory();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddProduct = (productData: any) => {
    addItem(productData);
    toast({ title: "Product added", description: `${productData.name} has been added to inventory.` });
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "SKU", "Category", "Quantity", "Reorder Point", "Price", "Cost", "Status", "Supplier"].join(","),
      ...inventory.map(item => [
        `"${item.name}"`,
        item.sku,
        item.category,
        item.quantity,
        item.reorderPoint,
        item.price,
        item.cost,
        item.status,
        `"${item.supplier}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: "Inventory data has been exported to CSV." });
  };

  return (
    <DashboardLayout 
      title="Inventory" 
      subtitle="Manage your product inventory and stock levels."
    >
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-72 pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTableFull 
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
      />

      {/* Add Product Dialog */}
      <ProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        mode="add"
      />
    </DashboardLayout>
  );
};

export default Inventory;
