import { InventoryItem, Order, Supplier, Activity, Alert } from "@/types/inventory";

const STORAGE_KEYS = {
  INVENTORY: "smartstock_inventory",
  ORDERS: "smartstock_orders",
  SUPPLIERS: "smartstock_suppliers",
  ACTIVITIES: "smartstock_activities",
  ALERTS: "smartstock_alerts",
  INITIALIZED: "smartstock_initialized",
};

// Default data for initial setup
const defaultInventory: InventoryItem[] = [
  { id: "1", name: "Wireless Mouse Pro", sku: "WMP-001", category: "Electronics", quantity: 145, reorderPoint: 50, price: 29.99, cost: 15.00, status: "healthy", supplier: "TechSupply Co", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "2", name: "USB-C Hub 7-in-1", sku: "UCH-007", category: "Electronics", quantity: 23, reorderPoint: 30, price: 49.99, cost: 25.00, status: "low", supplier: "TechSupply Co", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "3", name: "Mechanical Keyboard", sku: "MKB-102", category: "Electronics", quantity: 8, reorderPoint: 25, price: 89.99, cost: 45.00, status: "critical", supplier: "KeyMaster Inc", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "4", name: "Monitor Stand Deluxe", sku: "MSD-045", category: "Furniture", quantity: 67, reorderPoint: 20, price: 39.99, cost: 18.00, status: "healthy", supplier: "Office Essentials", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "5", name: "Webcam 4K Ultra", sku: "WCU-400", category: "Electronics", quantity: 12, reorderPoint: 15, price: 129.99, cost: 65.00, status: "low", supplier: "TechSupply Co", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "6", name: "Desk Organizer Set", sku: "DOS-010", category: "Office", quantity: 89, reorderPoint: 30, price: 24.99, cost: 10.00, status: "healthy", supplier: "Office Essentials", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "7", name: "Ergonomic Chair Pro", sku: "ECP-220", category: "Furniture", quantity: 5, reorderPoint: 10, price: 299.99, cost: 150.00, status: "critical", supplier: "ComfortPlus Furniture", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "8", name: "LED Desk Lamp", sku: "LDL-055", category: "Lighting", quantity: 156, reorderPoint: 40, price: 34.99, cost: 15.00, status: "healthy", supplier: "BrightWorks Ltd", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "9", name: "Laptop Stand Adjustable", sku: "LSA-088", category: "Accessories", quantity: 45, reorderPoint: 20, price: 59.99, cost: 28.00, status: "healthy", supplier: "TechSupply Co", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: "10", name: "Noise Cancelling Headphones", sku: "NCH-200", category: "Electronics", quantity: 34, reorderPoint: 15, price: 199.99, cost: 95.00, status: "healthy", supplier: "AudioMax Pro", lastUpdated: new Date().toISOString(), createdAt: new Date().toISOString() },
];

const defaultSuppliers: Supplier[] = [
  { id: "1", name: "TechSupply Co", email: "orders@techsupply.co", phone: "+1-555-0100", address: "123 Tech Park, Silicon Valley, CA", contactPerson: "John Smith", category: "Electronics", rating: 4.5, status: "active", totalOrders: 156, lastOrderDate: new Date().toISOString() },
  { id: "2", name: "Office Essentials", email: "sales@officeessentials.com", phone: "+1-555-0200", address: "456 Business Ave, New York, NY", contactPerson: "Sarah Johnson", category: "Office", rating: 4.2, status: "active", totalOrders: 89, lastOrderDate: new Date().toISOString() },
  { id: "3", name: "KeyMaster Inc", email: "support@keymaster.com", phone: "+1-555-0300", address: "789 Hardware Blvd, Austin, TX", contactPerson: "Mike Chen", category: "Electronics", rating: 4.8, status: "active", totalOrders: 45 },
  { id: "4", name: "ComfortPlus Furniture", email: "orders@comfortplus.com", phone: "+1-555-0400", address: "321 Comfort Lane, Chicago, IL", contactPerson: "Lisa Brown", category: "Furniture", rating: 4.0, status: "active", totalOrders: 23 },
  { id: "5", name: "BrightWorks Ltd", email: "sales@brightworks.co", phone: "+1-555-0500", address: "654 Light Street, Boston, MA", contactPerson: "David Lee", category: "Lighting", rating: 4.6, status: "active", totalOrders: 67 },
  { id: "6", name: "AudioMax Pro", email: "orders@audiomax.pro", phone: "+1-555-0600", address: "987 Sound Way, Seattle, WA", contactPerson: "Amy Wilson", category: "Electronics", rating: 4.7, status: "active", totalOrders: 34 },
];

const defaultOrders: Order[] = [
  { id: "1", orderNumber: "ORD-001", supplier: "TechSupply Co", items: [{ productId: "2", productName: "USB-C Hub 7-in-1", quantity: 50, unitPrice: 25.00 }], status: "shipped", totalAmount: 1250.00, orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "2", orderNumber: "ORD-002", supplier: "KeyMaster Inc", items: [{ productId: "3", productName: "Mechanical Keyboard", quantity: 30, unitPrice: 45.00 }], status: "pending", totalAmount: 1350.00, orderDate: new Date().toISOString(), expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "3", orderNumber: "ORD-003", supplier: "ComfortPlus Furniture", items: [{ productId: "7", productName: "Ergonomic Chair Pro", quantity: 15, unitPrice: 150.00 }], status: "confirmed", totalAmount: 2250.00, orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const defaultActivities: Activity[] = [
  { id: "1", type: "order_placed", title: "Order placed", description: "Order ORD-002 placed with KeyMaster Inc for 30 Mechanical Keyboards", timestamp: new Date().toISOString() },
  { id: "2", type: "low_stock_alert", title: "Low stock alert", description: "Mechanical Keyboard stock is critical (8 units)", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), relatedId: "3" },
  { id: "3", type: "stock_update", title: "Stock updated", description: "LED Desk Lamp quantity updated to 156", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), relatedId: "8" },
  { id: "4", type: "order_received", title: "Order received", description: "Order ORD-001 shipped from TechSupply Co", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: "5", type: "product_added", title: "Product added", description: "New product 'Noise Cancelling Headphones' added to inventory", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), relatedId: "10" },
];

const defaultAlerts: Alert[] = [
  { id: "1", type: "critical", title: "Mechanical Keyboard stock critical", description: "Only 8 units remaining. Reorder point is 25.", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false, productId: "3" },
  { id: "2", type: "critical", title: "Ergonomic Chair Pro nearly depleted", description: "Only 5 units left. Consider expedited reorder.", timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), read: false, productId: "7" },
  { id: "3", type: "warning", title: "USB-C Hub approaching reorder point", description: "23 units remaining, reorder point is 30.", timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), read: false, productId: "2" },
  { id: "4", type: "info", title: "Pending order from TechSupply Co", description: "Expected delivery in 3 business days.", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
];

// Storage utilities
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize default data if not exists
export function initializeStorage(): void {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    setItem(STORAGE_KEYS.INVENTORY, defaultInventory);
    setItem(STORAGE_KEYS.SUPPLIERS, defaultSuppliers);
    setItem(STORAGE_KEYS.ORDERS, defaultOrders);
    setItem(STORAGE_KEYS.ACTIVITIES, defaultActivities);
    setItem(STORAGE_KEYS.ALERTS, defaultAlerts);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");
  }
}

// Inventory operations
export function getInventory(): InventoryItem[] {
  return getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, defaultInventory);
}

export function saveInventory(items: InventoryItem[]): void {
  setItem(STORAGE_KEYS.INVENTORY, items);
}

export function addInventoryItem(item: Omit<InventoryItem, "id" | "status" | "lastUpdated" | "createdAt">): InventoryItem {
  const items = getInventory();
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    status: calculateStatus(item.quantity, item.reorderPoint),
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  saveInventory(items);
  addActivity({
    type: "product_added",
    title: "Product added",
    description: `New product '${newItem.name}' added to inventory`,
    relatedId: newItem.id,
  });
  return newItem;
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
  const items = getInventory();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const updatedItem = { 
    ...items[index], 
    ...updates, 
    lastUpdated: new Date().toISOString() 
  };
  
  if (updates.quantity !== undefined || updates.reorderPoint !== undefined) {
    updatedItem.status = calculateStatus(updatedItem.quantity, updatedItem.reorderPoint);
    checkAndCreateStockAlert(updatedItem);
  }
  
  items[index] = updatedItem;
  saveInventory(items);
  
  addActivity({
    type: "stock_update",
    title: "Stock updated",
    description: `${updatedItem.name} was updated`,
    relatedId: updatedItem.id,
  });
  
  return updatedItem;
}

export function deleteInventoryItem(id: string): boolean {
  const items = getInventory();
  const item = items.find(i => i.id === id);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length < items.length) {
    saveInventory(filtered);
    if (item) {
      addActivity({
        type: "product_removed",
        title: "Product removed",
        description: `'${item.name}' removed from inventory`,
        relatedId: id,
      });
    }
    return true;
  }
  return false;
}

function calculateStatus(quantity: number, reorderPoint: number): "healthy" | "low" | "critical" {
  if (quantity <= reorderPoint * 0.3) return "critical";
  if (quantity <= reorderPoint) return "low";
  return "healthy";
}

function checkAndCreateStockAlert(item: InventoryItem): void {
  const alerts = getAlerts();
  const existingAlert = alerts.find(a => a.productId === item.id && !a.read);
  
  if (item.status === "critical" && !existingAlert) {
    addAlert({
      type: "critical",
      title: `${item.name} stock critical`,
      description: `Only ${item.quantity} units remaining. Reorder point is ${item.reorderPoint}.`,
      productId: item.id,
    });
  } else if (item.status === "low" && !existingAlert) {
    addAlert({
      type: "warning",
      title: `${item.name} approaching reorder point`,
      description: `${item.quantity} units remaining, reorder point is ${item.reorderPoint}.`,
      productId: item.id,
    });
  }
}

// Order operations
export function getOrders(): Order[] {
  return getItem<Order[]>(STORAGE_KEYS.ORDERS, defaultOrders);
}

export function saveOrders(orders: Order[]): void {
  setItem(STORAGE_KEYS.ORDERS, orders);
}

export function addOrder(order: Omit<Order, "id" | "orderNumber">): Order {
  const orders = getOrders();
  const orderNumber = `ORD-${String(orders.length + 1).padStart(3, "0")}`;
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    orderNumber,
  };
  orders.push(newOrder);
  saveOrders(orders);
  addActivity({
    type: "order_placed",
    title: "Order placed",
    description: `Order ${orderNumber} placed with ${order.supplier}`,
    relatedId: newOrder.id,
  });
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === id);
  if (index === -1) return null;
  
  const updatedOrder = { ...orders[index], ...updates };
  orders[index] = updatedOrder;
  saveOrders(orders);
  
  if (updates.status === "delivered") {
    addActivity({
      type: "order_received",
      title: "Order received",
      description: `Order ${updatedOrder.orderNumber} has been delivered`,
      relatedId: updatedOrder.id,
    });
    
    // Update inventory quantities
    updatedOrder.items.forEach(item => {
      const inventoryItem = getInventory().find(i => i.id === item.productId);
      if (inventoryItem) {
        updateInventoryItem(item.productId, {
          quantity: inventoryItem.quantity + item.quantity,
        });
      }
    });
  }
  
  return updatedOrder;
}

// Supplier operations
export function getSuppliers(): Supplier[] {
  return getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, defaultSuppliers);
}

export function saveSuppliers(suppliers: Supplier[]): void {
  setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
}

export function addSupplier(supplier: Omit<Supplier, "id" | "totalOrders">): Supplier {
  const suppliers = getSuppliers();
  const newSupplier: Supplier = {
    ...supplier,
    id: crypto.randomUUID(),
    totalOrders: 0,
  };
  suppliers.push(newSupplier);
  saveSuppliers(suppliers);
  return newSupplier;
}

export function updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  suppliers[index] = { ...suppliers[index], ...updates };
  saveSuppliers(suppliers);
  return suppliers[index];
}

export function deleteSupplier(id: string): boolean {
  const suppliers = getSuppliers();
  const filtered = suppliers.filter(s => s.id !== id);
  if (filtered.length < suppliers.length) {
    saveSuppliers(filtered);
    return true;
  }
  return false;
}

// Activity operations
export function getActivities(): Activity[] {
  return getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, defaultActivities);
}

export function addActivity(activity: Omit<Activity, "id" | "timestamp">): Activity {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  // Keep only last 50 activities
  if (activities.length > 50) {
    activities.pop();
  }
  setItem(STORAGE_KEYS.ACTIVITIES, activities);
  return newActivity;
}

// Alert operations
export function getAlerts(): Alert[] {
  return getItem<Alert[]>(STORAGE_KEYS.ALERTS, defaultAlerts);
}

export function addAlert(alert: Omit<Alert, "id" | "timestamp" | "read">): Alert {
  const alerts = getAlerts();
  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  alerts.unshift(newAlert);
  setItem(STORAGE_KEYS.ALERTS, alerts);
  return newAlert;
}

export function markAlertAsRead(id: string): void {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts[index].read = true;
    setItem(STORAGE_KEYS.ALERTS, alerts);
  }
}

export function markAllAlertsAsRead(): void {
  const alerts = getAlerts();
  alerts.forEach(a => a.read = true);
  setItem(STORAGE_KEYS.ALERTS, alerts);
}

// Analytics calculations
export function getInventoryStats() {
  const inventory = getInventory();
  const orders = getOrders();
  
  const totalProducts = inventory.length;
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const inventoryCost = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const lowStockItems = inventory.filter(item => item.status === "low" || item.status === "critical").length;
  const criticalItems = inventory.filter(item => item.status === "critical").length;
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyOrders = orders.filter(o => new Date(o.orderDate) >= thisMonth);
  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const categoryBreakdown = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity * item.price;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalProducts,
    totalQuantity,
    inventoryValue,
    inventoryCost,
    potentialProfit: inventoryValue - inventoryCost,
    lowStockItems,
    criticalItems,
    monthlySales,
    categoryBreakdown,
  };
}
