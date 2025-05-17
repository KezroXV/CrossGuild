"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  Box,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard />,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <Box />,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: <FolderTree />,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: <Box />,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart />,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users />,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: <MessageSquare />,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <BarChart3 />,
  },

  {
    title: "Content Management",
    href: "/admin/content-management",
    icon: <Settings />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { open, setOpen } = useSidebar();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSidebarChange = (newState: boolean) => {
    setOpen(newState);
    localStorage.setItem("sidebar-state", String(newState));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative">
      <SidebarTrigger
        className={cn(
          "absolute right-[-40px] top-4 z-50 h-8 w-8",
          "hover:bg-accent/50"
        )}
      />
      <Sidebar
        variant="inset"
        className={cn(
          "border-r transition-all duration-300",
          !open ? "w-[60px]" : "w-[240px]"
        )}
      >
        <SidebarHeader className="border-b">
          <div className="flex items-center px-2 py-4 justify-between">
            <h2
              className={cn(
                "text-lg font-semibold tracking-tight transition-all",
                !open && "opacity-0 w-0"
              )}
            >
              Admin Panel
            </h2>

            {open && <ModeToggle />}
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu>
            {adminNavItems?.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={!open ? item.title : undefined}
                  className={cn(
                    "w-full gap-2",
                    !open ? "justify-center px-2" : "justify-start px-3"
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span
                      className={cn(
                        "font-medium transition-all",
                        !open && "w-0 opacity-0 hidden"
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="outline"
                tooltip={!open ? "Logout" : undefined}
                className={cn(
                  "mt-4 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
                  !open ? "justify-center px-2" : "justify-start px-3"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span
                  className={cn(
                    "font-medium transition-all",
                    !open && "w-0 opacity-0 hidden"
                  )}
                >
                  Logout
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t p-3">
          <div
            className={cn(
              "flex items-center gap-3 transition-all",
              !open && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>
                {session?.user?.name?.slice(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn("flex flex-col transition-all", !open && "hidden")}
            >
              <p className="text-sm font-medium leading-none">
                {session?.user?.name || "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
