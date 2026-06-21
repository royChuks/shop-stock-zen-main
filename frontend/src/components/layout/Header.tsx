import { useState } from "react";
import { Bell, Search, Plus, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProductDialog } from "@/components/inventory/ProductDialog";
import { useInventory } from "@/hooks/useInventory";
import type { InventoryItem } from "@/types/inventory";
import { toast } from "@/components/ui/use-toast";

type AddProductData = Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">;

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddProduct = (productData: AddProductData) => {
    addItem(productData);
    setIsAddDialogOpen(false);
    toast({ title: "Product added", description: `${productData.name} has been added to inventory.` });
  };

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
          {subtitle && <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-medium text-critical-foreground">
            3
          </span>
        </Button>

        {/* Add Item */}
        <Button className="gap-2 px-3 sm:px-4" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>

        {/* User Profile Dropdown */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.businessName && (
                    <p className="text-xs text-muted-foreground">{user.businessName}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Add Product Dialog */}
      <ProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddProduct}
        mode="add"
      />
    </header>
  );
}
