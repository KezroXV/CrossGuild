"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface LoadingStateProps {
  title?: string;
  type?: "simple" | "product-list" | "cart" | "detail";
  count?: number;
}

export const LoadingState = ({
  title = "Loading...",
  type = "simple",
  count = 3,
}: LoadingStateProps) => {
  if (type === "simple") {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-4"></div>
        <p className="text-accent">{title}</p>
      </div>
    );
  }

  if (type === "product-list") {
    return (
      <div className="w-full p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-32" />
        </motion.div>

        <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border dark:border-border dark:shadow-none">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <Skeleton className="h-10 w-full md:w-72" />
            <div className="flex gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="grid gap-4 p-4">
              {Array(count)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 p-2">
                    <Skeleton className="h-20 w-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center space-x-2 self-start">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "cart") {
    return (
      <div className="w-full p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-32" />
        </motion.div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b dark:border-border"
                >
                  <div className="flex gap-3 items-center">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            <div className="flex justify-end pt-4">
              <div className="w-48">
                <Skeleton className="h-7 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Detail view loading state
  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="pt-4">
            <Skeleton className="h-10 w-full mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
