"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ProfileInfo } from "@/features/auth/components/profile-info.component";
import { ProfileSettings } from "@/features/auth/components/profile-settings.component";
import { OrderHistory } from "@/features/auth/components/order-history.component";
import { useProfile } from "@/features/auth/hooks/use-profile.hook";
import { useOrders } from "@/features/auth/hooks/use-orders.hook";

function ProfileContent() {
  const searchParams = useSearchParams();
  const defaultTab =
    searchParams?.get("tab") === "orders" ? "orders" : "personal-info";

  const {
    session,
    status,
    personalInfoForm,
    passwordChangeForm,
    image,
    imagePreview,
    isUploading,
    isUpdating,
    isChangingPassword,
    handleImageChange,
    onPersonalInfoSubmit,
    onPasswordChangeSubmit,
  } = useProfile();

  const ordersState = useOrders();

  if (status === "loading") {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href="/">
          <Button variant="outline" className="flex gap-2 items-center">
            <Home size={18} />
            <span>Home</span>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal-info">Personal Information</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="space-y-6">
          <ProfileInfo
            form={personalInfoForm}
            currentImage={session?.user?.image}
            imagePreview={imagePreview}
            hasNewImage={!!image}
            isUploading={isUploading}
            isUpdating={isUpdating}
            onImageChange={handleImageChange}
            onSubmit={onPersonalInfoSubmit}
          />
          <ProfileSettings
            form={passwordChangeForm}
            isChangingPassword={isChangingPassword}
            onSubmit={onPasswordChangeSubmit}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory
            orders={ordersState.orders}
            isLoading={ordersState.isLoading}
            currentPage={ordersState.currentPage}
            totalPages={ordersState.totalPages}
            selectedOrder={ordersState.selectedOrder}
            isOrderDetailsOpen={ordersState.isOrderDetailsOpen}
            setIsOrderDetailsOpen={ordersState.setIsOrderDetailsOpen}
            isCancelDialogOpen={ordersState.isCancelDialogOpen}
            setIsCancelDialogOpen={ordersState.setIsCancelDialogOpen}
            onViewOrder={ordersState.openOrderDetails}
            onCancelOrder={ordersState.openCancelDialog}
            onConfirmCancel={ordersState.handleCancelOrder}
            onPageChange={ordersState.fetchPage}
            isCancelling={ordersState.isCancelling}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfileView() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
