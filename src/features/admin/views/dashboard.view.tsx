"use client";

import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Euro, Package, ShoppingBag, Star, Users } from "lucide-react";
import { useAdminStats } from "@/features/admin/hooks/use-admin-stats.hook";

export default function DashboardView() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Users className="h-10 w-10 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{stats?.totalUsers}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <ShoppingBag className="h-10 w-10 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{stats?.totalOrders}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Package className="h-10 w-10 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h3 className="text-2xl font-bold">{stats?.totalItems}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Euro className="h-10 w-10 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                €{stats?.revenue.toFixed(2)}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">New Customers</h2>
          <div className="space-y-4">
            {stats?.newUsers.slice(0, 3).map((user) => (
              <div key={user.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
          <div className="space-y-4">
            {stats?.recentReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.user.image || undefined} />
                    <AvatarFallback>
                      {review.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{review.user.name}</span>
                  <div className="flex items-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm">{review.content}</p>
                <p className="text-xs text-muted-foreground">
                  On {review.item.name}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {stats?.recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.slice(0, 8)}
                </p>
              </div>
              <div>
                <p className="font-medium">€{order.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
