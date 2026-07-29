"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useAdminCategories } from "@/features/admin/hooks/use-admin-categories.hook";
import type { AdminCategory } from "@/features/admin/types/admin.type";

const EMPTY_FORM = { name: "", description: "", image: "" };

export default function CategoriesView() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } =
    useAdminCategories();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);

  const pageSizeNum = parseInt(pageSize, 10);
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSizeNum));

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSizeNum,
    currentPage * pageSizeNum
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory(formData);
    setIsOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    await updateCategory({ id: editingCategory.id, ...formData });
    setIsEditOpen(false);
    setFormData(EMPTY_FORM);
    setEditingCategory(null);
  };

  const confirmDelete = (id: string) => {
    setDeletingCategoryId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCategoryId) return;

    await deleteCategory(deletingCategoryId);
    setDeletingCategoryId(null);
    setIsAlertOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Input
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={handleImageChange}
              />
              {formData.image && (
                <div className="relative w-32 h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <Button type="submit">Create Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Input
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={handleImageChange}
            />
            {formData.image && (
              <div className="relative w-32 h-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.image}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded"
                />
              </div>
            )}
            <Button type="submit">Update Category</Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading && <p className="text-blue-500 mb-4">Loading...</p>}

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCategories.length > 0 ? (
            paginatedCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => confirmDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                {isLoading ? "Loading categories..." : "No categories found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-6">
        <div>
          <Select
            value={pageSize}
            onValueChange={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages || isLoading}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
