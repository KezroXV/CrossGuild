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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to fetch users");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/api/admin/roles");
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setError("Failed to fetch roles");
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      const response = await axios.put("/api/admin/users", {
        id: userId,
        roleId,
      });
      setUsers(
        users.map((user) => (user.id === userId ? response.data.user : user))
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
      setError("Failed to update user role");
    }
  };

  const handleAdminToggle = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await axios.put("/api/admin/users", {
        id: userId,
        isAdmin,
      });
      setUsers(
        users.map((user) => (user.id === userId ? response.data.user : user))
      );
    } catch (error) {
      console.error("Failed to update user admin status:", error);
      setError("Failed to update user admin status");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete("/api/admin/users", { data: { id: userId } });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
      setError("Failed to delete user");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Picture</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} />
                  <AvatarFallback>
                    {user.name?.slice(0, 2).toUpperCase() || "NA"}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role?.id || "none"}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.isAdmin}
                  onCheckedChange={(checked) =>
                    handleAdminToggle(user.id, checked)
                  }
                />
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersPage;
