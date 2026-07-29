"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  ReviewPagination,
  ReviewSearch,
} from "@/features/admin/components/reviews/review-filters.component";
import {
  deleteAdminContact,
  fetchAdminContacts,
  updateAdminContactStatus,
} from "@/features/admin/services/admin.service";

const DEPARTMENT_LABELS: Record<string, string> = {
  customer_support: "Customer Support",
  technical: "Technical Help",
  billing: "Billing",
};

function formatDepartment(department: string) {
  return DEPARTMENT_LABELS[department] ?? "General Inquiry";
}

export default function ContactsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const pageSizeNum = parseInt(pageSize, 10);

  const contactsQuery = useQuery({
    queryKey: ["admin", "contacts", currentPage, pageSizeNum, search],
    queryFn: () =>
      fetchAdminContacts({ page: currentPage, pageSize: pageSizeNum, search }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });

  const resolveMutation = useMutation({
    mutationFn: ({ id, isResolved }: { id: string; isResolved: boolean }) =>
      updateAdminContactStatus(id, isResolved),
    onSuccess: (_, { isResolved }) => {
      toast.success(`Message marked as ${isResolved ? "resolved" : "unresolved"}`);
      invalidate();
    },
    onError: () => toast.error("Failed to update message status"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminContact,
    onSuccess: () => {
      toast.success("Contact message deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete message"),
  });

  const contacts = contactsQuery.data?.contacts ?? [];
  const totalPages = contactsQuery.data?.totalPages ?? 1;

  return (
    <>
      {contactsQuery.isLoading && (
        <p className="text-blue-500 mb-6">Loading messages...</p>
      )}

      <ReviewSearch
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        placeholder="Search messages..."
      />

      <div className="grid gap-6">
        {contacts.length > 0 ? (
          contacts.map((message) => (
            <Card
              key={message.id}
              className={`p-5 shadow-sm hover:shadow-md transition-shadow ${
                message.isResolved ? "bg-muted/20" : "bg-background"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{message.subject}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          message.isResolved
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {message.isResolved ? "Resolved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <p>From: {message.name}</p>
                      <p>Department: {formatDepartment(message.department)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={message.isResolved ? "outline" : "default"}
                      size="sm"
                      onClick={() =>
                        resolveMutation.mutate({
                          id: message.id,
                          isResolved: !message.isResolved,
                        })
                      }
                    >
                      {message.isResolved ? "Mark Unresolved" : "Resolve"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(message.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md">
                    {message.message}
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Received:{" "}
                      {new Date(message.createdAt).toLocaleDateString()} at{" "}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                    <a
                      href={`mailto:${message.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          !contactsQuery.isLoading && (
            <div className="text-center py-10 text-muted-foreground">
              No contact messages found
            </div>
          )
        )}
      </div>

      <ReviewPagination
        pageSize={pageSize}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </>
  );
}
