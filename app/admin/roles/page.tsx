"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

const permissionsList = [
  "MANAGE_PRODUCTS",
  "MANAGE_CATEGORIES",
  "MANAGE_USERS",
  "MANAGE_ORDERS",
  "MANAGE_REVIEWS",
  "VIEW_REPORTS",
  "MANAGE_SETTINGS",
];

const RolesPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/api/admin/roles");
      setRoles(response.data.roles);
    } catch (error) {
      setError("Failed to fetch roles");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/roles", formData);
      setRoles([...roles, response.data.role]);
      setIsOpen(false);
      setFormData({ name: "", permissions: [] });
    } catch (error) {
      setError("Failed to add role");
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/admin/roles", {
        id: editingRole?.id,
        ...formData,
      });
      setRoles(
        roles.map((role) =>
          role.id === editingRole?.id ? response.data.role : role
        )
      );
      setIsEditOpen(false);
      setFormData({ name: "", permissions: [] });
      setEditingRole(null);
    } catch (error) {
      setError("Failed to update role");
    }
  };

  const handlePermissionChange = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((perm) => perm !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const RoleForm = ({
    onSubmit,
    buttonText,
  }: {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    buttonText: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        placeholder="Role Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <div>
        <h3 className="font-semibold mb-2">Permissions</h3>
        {permissionsList.map((permission) => (
          <div key={permission} className="flex items-center mb-2">
            <Checkbox
              checked={formData.permissions.includes(permission)}
              onCheckedChange={() => handlePermissionChange(permission)}
            />
            <span className="ml-2">{permission}</span>
          </div>
        ))}
      </div>
      <Button type="submit">{buttonText}</Button>
    </form>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <RoleForm onSubmit={handleSubmit} buttonText="Create Role" />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
          </DialogHeader>
          <RoleForm onSubmit={handleUpdate} buttonText="Update Role" />
        </DialogContent>
      </Dialog>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell className="font-medium">{role.name}</TableCell>
              <TableCell>{role.permissions.join(", ")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(role)}>
                    Edit
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

export default RolesPage;
