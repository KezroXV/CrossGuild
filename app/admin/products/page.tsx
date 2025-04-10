/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  images: { id: string; url: string }[];
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  brandId?: string;
  cost?: number;
  margin?: number;
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    categoryId: "",
    images: [] as string[],
    brandId: "",
    cost: "",
    options: [
      {
        name: "",
        values: [] as string[],
      },
    ],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [currentPage, pageSize]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Log what we're sending to the API for debugging
      console.log("Fetching products with params:", {
        page: currentPage,
        pageSize: parseInt(pageSize),
      });

      const response = await axios.get("/api/admin/products", {
        params: {
          page: currentPage,
          pageSize: parseInt(pageSize),
          // Also include limit as some APIs use this instead
          limit: parseInt(pageSize),
        },
      });

      // Log the response for debugging
      console.log("Products API response:", response.data);

      setProducts(response.data.products || []);

      // Calculate total pages
      if (response.data.totalPages !== undefined) {
        setTotalPages(response.data.totalPages);
      } else if (response.data.total !== undefined) {
        setTotalPages(
          Math.max(1, Math.ceil(response.data.total / parseInt(pageSize)))
        );
      } else {
        // If server doesn't provide pagination info, make an educated guess
        const receivedCount = response.data.products?.length || 0;
        const isFullPage = receivedCount >= parseInt(pageSize);
        // If we got a full page, there might be more
        setTotalPages(currentPage + (isFullPage ? 1 : 0));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/categories");
      setCategories(response.data.categories);
    } catch (error) {
      toast.error("Failed to fetch categories");
      setError("Failed to fetch categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/brands");
      setBrands(response.data);
    } catch (error) {
      toast.error("Failed to fetch brands");
      setError("Failed to fetch brands");
    }
  };

  const closeAddDialog = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      description: "",
      categoryId: "",
      images: [],
      brandId: "",
      cost: "",
      options: [
        {
          name: "",
          values: [] as string[],
        },
      ],
    });
    setIsOpen(false);
  };

  const closeEditDialog = () => {
    setFormData({
      name: "",
      price: "",
      quantity: "",
      description: "",
      categoryId: "",
      images: [],
      brandId: "",
      cost: "",
      options: [
        {
          name: "",
          values: [] as string[],
        },
      ],
    });
    setEditingProduct(null);
    setIsEditOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/products", formData);
      toast.success("Product created successfully");
      closeAddDialog();
      fetchProducts();
    } catch (error) {
      toast.error("Failed to create product");
      setError("Failed to create product");
    }
  };

  const handleEdit = (product: Product) => {
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
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put("/api/admin/products", {
        id: editingProduct?.id,
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        cost: parseFloat(formData.cost),
      });
      toast.success("Product updated successfully");
      closeEditDialog();
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete("/api/admin/products", { data: { id } });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
      setError("Failed to delete product");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const response = await axios.post("/api/upload", formData);
          return response.data.url;
        });

        const urls = await Promise.all(uploadPromises);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...urls],
        }));
        toast.success("Images uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload images");
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
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
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (newPage <= totalPages || totalPages === 0)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const ImagePreview = ({
    images,
    onRemove,
  }: {
    images: string[];
    onRemove: (index: number) => void;
  }) => (
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
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 
                     opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  // Filter products based on search term - only if searching
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Cost"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
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
                      {categories.map((category: any) => (
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
                      {brands.map((brand: any) => (
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
                  <Button
                    type="button"
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                  >
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
                      value={option.values.join(", ")}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          "values",
                          e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter((v) => v !== "")
                        )
                      }
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
              <ImagePreview
                images={formData.images}
                onRemove={handleRemoveImage}
              />
              <Button type="submit">Create Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Cost"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
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
                    {categories.map((category: any) => (
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
                    {brands.map((brand: any) => (
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
                <Button
                  type="button"
                  onClick={addOption}
                  variant="outline"
                  size="sm"
                >
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
                    value={option.values.join(", ")}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        "values",
                        e.target.value
                          .split(",")
                          .map((v) => v.trim())
                          .filter((v) => v !== "")
                      )
                    }
                  />
                  {option.values.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {option.values.map((value, vIndex) => (
                        <div
                          key={vIndex}
                          className="bg-secondary/30 px-2 py-1 rounded-full text-sm"
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
            <ImagePreview
              images={formData.images}
              onRemove={handleRemoveImage}
            />
            <Button type="submit">Update Product</Button>
          </form>
        </DialogContent>
      </Dialog>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading products...</p>}

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
                <TableCell>${product.price}</TableCell>
                <TableCell>${product.cost || "0"}</TableCell>
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
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
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
                {loading ? "Loading products..." : "No products found"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Improved Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <Select value={pageSize} onValueChange={handlePageSizeChange}>
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
            disabled={currentPage <= 1 || loading}
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
            disabled={(totalPages > 0 && currentPage >= totalPages) || loading}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
