"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/categories");
      setCategories(response.data.categories);
    } catch (error) {
      toast.error("Failed to fetch categories");
      setError("Failed to fetch categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/categories", formData);
      toast.success("Category created successfully");
      setCategories([...categories, response.data.category]);
      setIsOpen(false);
      setFormData({ name: "", description: "", image: "" });
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleEdit = (category: Category) => {
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
    try {
      const data = {
        id: editingCategory?.id,
        ...formData,
      };
      const response = await axios.put("/api/admin/categories", data);
      toast.success("Category updated successfully");
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory?.id ? response.data.category : cat
        )
      );
      setIsEditOpen(false);
      setFormData({ name: "", description: "", image: "" });
      setEditingCategory(null);
    } catch (error) {
      toast.error("Failed to update category");
      setError("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/admin/categories", { data: { id } });
      toast.success("Category deleted successfully");
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      toast.error("Failed to delete category");
      setError("Failed to delete category");
    }
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
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Textarea
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Input
                type="file"
                name="image"
                accept="image/*"
                className="cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({
                        ...formData,
                        image: reader.result as string,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {formData.image && (
                <div className="relative w-32 h-32">
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
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Input
              type="file"
              name="image"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({
                      ...formData,
                      image: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.image && (
              <div className="relative w-32 h-32">
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

      {error && <p className="text-red-500 mb-4">{error}</p>}

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
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                {category.image && (
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
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoriesPage;
