import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useOrders } from "@/hooks/useOrders";
import { Search, Plus, MoreHorizontal, Package, Truck, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types/inventory";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/20" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-success/10 text-success border-success/20" },
  delivered: { label: "Delivered", icon: Package, className: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-critical/10 text-critical border-critical/20" },
};

const Orders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, { status: newStatus });
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    inProgress: orders.filter(o => o.status === "confirmed" || o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  return (
    <DashboardLayout 
      title="Orders" 
      subtitle="Manage purchase orders and track deliveries."
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem] lg:flex lg:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full pl-9 lg:w-72"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 sm:self-start lg:self-auto">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className={cn("p-3 rounded-lg", statusConfig[order.status].className.replace("text-", "bg-").split(" ")[0])}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold">{order.orderNumber}</h3>
                          <Badge variant="outline" className={statusConfig[order.status].className}>
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {order.supplier} • {order.items.length} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-6">
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">${order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          Expected: {format(new Date(order.expectedDelivery), "MMM d, yyyy")}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "confirmed")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Confirmed
                            </DropdownMenuItem>
                          )}
                          {order.status === "confirmed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "shipped")}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === "shipped" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "delivered")}>
                              <Package className="mr-2 h-4 w-4" />
                              Mark Delivered
                            </DropdownMenuItem>
                          )}
                          {order.status !== "cancelled" && order.status !== "delivered" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")} className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{selectedOrder.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusConfig[selectedOrder.status].className}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.orderDate), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">{format(new Date(selectedOrder.expectedDelivery), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="font-semibold">Total Amount</p>
                <p className="text-xl font-bold">${selectedOrder.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Orders;
