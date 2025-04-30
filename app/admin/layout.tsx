"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    } else if (status === "authenticated" && !session?.user?.isAdmin) {
      window.location.href = "/";
    }
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated" && session?.user?.isAdmin) {
    const savedState = localStorage.getItem("sidebar-state");
    const initialState = savedState !== null ? savedState === "true" : true;

    return (
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen={initialState}>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <SidebarInset>
              <main className="flex-1 p-6">
                <div className="container mx-auto">{children}</div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </QueryClientProvider>
    );
  }

  return null;
}
