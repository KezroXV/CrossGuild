"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/shared/components/layout/admin-sidebar.component";
import { SidebarProvider, SidebarInset } from "@/shared/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState !== null) {
      setDefaultOpen(savedState === "true");
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="container mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
