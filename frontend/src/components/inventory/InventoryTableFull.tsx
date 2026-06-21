import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InventoryItem } from "@/types/inventory";
import { ProductDialog } from "./ProductDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useInventory } from "@/hooks/useInventory";

const statusConfig = {
  healthy: { label: "In Stock", className: "status-healthy" },
  low: { label: "Low Stock", className: "status-low" },
  critical: { label: "Critical", className: "status-critical" },
};

interface InventoryTableFullProps {
  searchQuery?: string;
  statusFilter?: string;
  categoryFilter?: string;
}

export function InventoryTableFull({ searchQuery = "", statusFilter = "all", categoryFilter = "all" }: InventoryTableFullProps) {
  const { inventory, updateItem, deleteItem, addItem, sortItems, searchItems, filterByStatus, filterByCategory } = useInventory();
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<InventoryItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Apply filters
  let filteredItems = inventory;
  if (searchQuery) {
    filteredItems = searchItems(searchQuery);
  }
  if (statusFilter !== "all") {
    filteredItems = filteredItems.filter(item => item.status === statusFilter);
  }
  if (categoryFilter !== "all") {
    filteredItems = filteredItems.filter(item => item.category === categoryFilter);
  }

  // Apply sorting
  const sortedItems = sortItems(filteredItems, sortBy, sortOrder);
  
  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleEdit = (product: InventoryItem) => {
    setEditingProduct(product);
  };

  const handleDelete = (product: InventoryItem) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteItem(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const handleSaveEdit = (productData: Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">) => {
    if (editingProduct) {
      updateItem(editingProduct.id, productData);
      setEditingProduct(null);
    }
  };

  const handleAddProduct = (productData: Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">) => {
    addItem(productData);
    setIsAddDialogOpen(false);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">Inventory Items</h3>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} items {searchQuery && `matching "${searchQuery}"`}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleSort("quantity")}>
            <ArrowUpDown className="h-4 w-4" />
            Sort by Quantity
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("name")}>
                  Product {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("quantity")}>
                  Qty {sortBy === "quantity" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Reorder Point</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("price")}>
                  Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-12 w-12 text-muted-foreground/40" />
                      <div>
                        <p className="font-medium text-muted-foreground">No products found</p>
                        <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} items
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingProduct && (
        <ProductDialog
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          product={editingProduct}
          onSave={handleSaveEdit}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
      />
    </>
  );
}
