/* eslint-disable @next/next/no-img-element */
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
import { useAdminProducts } from "@/features/admin/hooks/use-admin-products.hook";
import type {
  AdminProduct,
  AdminProductFormInput,
} from "@/features/admin/types/admin.type";

const EMPTY_FORM: AdminProductFormInput = {
  name: "",
  price: "",
  quantity: "",
  description: "",
  categoryId: "",
  images: [],
  brandId: "",
  cost: "",
  options: [{ name: "", values: [] }],
};

function ImagePreview({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {images.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt="preview"
            className="w-20 h-20 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ProductsView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [optionInputValues, setOptionInputValues] = useState<string[]>([""]);
  const [formData, setFormData] = useState<AdminProductFormInput>(EMPTY_FORM);

  const {
    products,
    totalPages,
    categories,
    brands,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
  } = useAdminProducts(currentPage, parseInt(pageSize, 10));

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setOptionInputValues([""]);
  };

  const closeAddDialog = () => {
    resetForm();
    setIsOpen(false);
  };

  const closeEditDialog = () => {
    resetForm();
    setEditingProduct(null);
    setIsEditOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct(formData);
    closeAddDialog();
  };

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description || "",
      categoryId: product.category?.id || "",
      images: product.images.map((img) => img.url),
      brandId: product.brand?.id || "",
      cost: product.cost ? product.cost.toString() : "0",
      options:
        product.options && product.options.length > 0
          ? product.options.map((opt) => ({
              name: opt.name,
              values: opt.values,
            }))
          : [{ name: "", values: [] }],
    });

    const inputValues =
      product.options && product.options.length > 0
        ? product.options.map((opt) => opt.values.join(", "))
        : [""];
    setOptionInputValues(inputValues);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateProduct({ id: editingProduct.id, input: formData });
    closeEditDialog();
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls = await uploadImages(Array.from(files));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleOptionChange = (
    index: number,
    field: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { name: "", values: [] }],
    }));
    setOptionInputValues((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
    setOptionInputValues((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOptionInputValue = (index: number, value: string) => {
    setOptionInputValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });

    if (value.includes(",")) {
      const values = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v !== "");
      handleOptionChange(index, "values", values);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= totalPages &&
      newPage !== currentPage &&
      !isLoading
    ) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filteredProducts = searchTerm
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.category?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.brand?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : products;

  const renderProductForm = (onSubmit: (e: React.FormEvent) => void, submitLabel: string) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <div className="flex gap-4">
        <Input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Cost"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
        />
      </div>
      <Input
        type="number"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={(e) =>
          setFormData({ ...formData, quantity: e.target.value })
        }
      />
      <Textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <div className="flex gap-4">
        <div className="flex-1">
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select
            value={formData.brandId}
            onValueChange={(value) =>
              setFormData({ ...formData, brandId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Options</h3>
          <Button type="button" onClick={addOption} variant="outline" size="sm">
            Add Option
          </Button>
        </div>
        {formData.options.map((option, index) => (
          <div
            key={index}
            className="space-y-2 p-3 bg-gray-50 rounded-lg relative"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Option {index + 1}</h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeOption(index)}
              >
                Remove
              </Button>
            </div>
            <Input
              placeholder="Option name (e.g., Size, Color)"
              value={option.name}
              onChange={(e) =>
                handleOptionChange(index, "name", e.target.value)
              }
            />
            <Input
              placeholder="Values (comma separated)"
              value={optionInputValues[index] || ""}
              onChange={(e) => updateOptionInputValue(index, e.target.value)}
              onBlur={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v !== "");
                handleOptionChange(index, "values", values);
              }}
            />
            {option.values.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {option.values.map((value, vIndex) => (
                  <div
                    key={vIndex}
                    className="bg-blue-100 px-2 py-1 rounded-full text-sm"
                  >
                    {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <Input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />
      <ImagePreview images={formData.images} onRemove={handleRemoveImage} />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {renderProductForm(handleSubmit, "Create Product")}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {renderProductForm(handleUpdate, "Update Product")}
        </DialogContent>
      </Dialog>

      {isLoading && <p className="text-blue-500 mb-4">Loading products...</p>}

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search products..."
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
            <TableHead>Price</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Margin</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] && (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>€{product.price}</TableCell>
                <TableCell>€{product.cost || "0"}</TableCell>
                <TableCell>
                  {product.margin ? `${product.margin.toFixed(1)}%` : "N/A"}
                </TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{product.category?.name || "No Category"}</TableCell>
                <TableCell>{product.brand?.name || "No Brand"}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {product.options && product.options.length > 0 ? (
                      product.options.map((option) => (
                        <div key={option.id} className="text-xs">
                          <span className="font-medium">{option.name}:</span>{" "}
                          {option.values.join(", ")}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No options</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-4">
                {isLoading ? "Loading products..." : "No products found"}
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm">
            Page {currentPage} {totalPages > 0 ? `of ${totalPages}` : ""}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading || totalPages <= 1}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
