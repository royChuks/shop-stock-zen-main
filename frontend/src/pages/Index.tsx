import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back! Here's your inventory overview."
    >
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Products"
          value="1,248"
          change={{ value: "12%", trend: "up" }}
          icon={Package}
        />
        <StatCard
          title="Inventory Value"
          value="$84,520"
          change={{ value: "8.2%", trend: "up" }}
          icon={DollarSign}
        />
        <StatCard
          title="Low Stock Items"
          value="23"
          change={{ value: "3", trend: "down" }}
          icon={AlertTriangle}
        />
        <StatCard
          title="Sales This Month"
          value="$12,840"
          change={{ value: "15.3%", trend: "up" }}
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          <InventoryChart />
          <InventoryTable />
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <AlertsPanel />
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
