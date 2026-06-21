import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ReactNode, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="min-w-0 md:ml-64">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="w-full max-w-full p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
