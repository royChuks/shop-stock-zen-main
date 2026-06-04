import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";
import { useOrders } from "@/hooks/useOrders";
import { getInventoryStats } from "@/lib/storage";
import { Download, FileText, BarChart3, Package, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Reports = () => {
  const { inventory } = useInventory();
  const { orders } = useOrders();
  const stats = getInventoryStats();

  const generateReport = (type: string) => {
    toast({ title: "Report Generated", description: `${type} report has been generated.` });
  };

  const reports = [
    { title: "Inventory Summary", description: "Complete inventory overview with stock levels", icon: Package, data: `${stats.totalProducts} products, $${stats.inventoryValue.toLocaleString()} value` },
    { title: "Low Stock Report", description: "Items below reorder point", icon: BarChart3, data: `${stats.lowStockItems} items need attention` },
    { title: "Order History", description: "All purchase orders and status", icon: FileText, data: `${orders.length} total orders` },
    { title: "Financial Summary", description: "Inventory costs and potential profit", icon: DollarSign, data: `$${stats.potentialProfit.toLocaleString()} potential profit` },
  ];

  return (
    <DashboardLayout title="Reports" subtitle="Generate and download inventory reports.">
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.data}</p>
              <Button variant="outline" className="gap-2" onClick={() => generateReport(report.title)}>
                <Download className="h-4 w-4" /> Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
