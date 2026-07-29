"use client";

import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useAdminBrands } from "@/features/admin/hooks/use-admin-brands.hook";
import type { AdminBrand } from "@/features/admin/types/admin.type";

export default function BrandsView() {
  const { brands, createBrand, updateBrand, deleteBrand } = useAdminBrands();
  const [isOpen, setIsOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<AdminBrand | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteBrand(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (isEditing && currentBrand) {
      await updateBrand({ id: currentBrand.id, formData });
    } else {
      await createBrand(formData);
    }

    handleCloseDialog();
  };

  const handleEdit = (brand: AdminBrand) => {
    setCurrentBrand(brand);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleOpenDialog = () => {
    setCurrentBrand(null);
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setCurrentBrand(null);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>Add Brand</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[425px]"
              onPointerDownOutside={handleCloseDialog}
            >
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit" : "Add New"} Brand
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isEditing && (
                  <input type="hidden" name="id" value={currentBrand?.id} />
                )}
                <div className="space-y-2">
                  <label>Name</label>
                  <Input
                    name="name"
                    required
                    defaultValue={currentBrand?.name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label>Description</label>
                  <Textarea
                    name="description"
                    defaultValue={currentBrand?.description || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label>Logo</label>
                  {isEditing && currentBrand?.logo && (
                    <div className="mb-2">
                      <p className="text-sm mb-1">Current logo:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentBrand.logo}
                        alt={currentBrand.name}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  )}
                  <Input
                    name="logo"
                    type="file"
                    accept="image/*"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update" : "Save"} Brand
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.name}</TableCell>
                <TableCell>{brand.description}</TableCell>
                <TableCell>
                  {brand.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-8 w-8 object-contain"
                    />
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(brand)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(brand.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
