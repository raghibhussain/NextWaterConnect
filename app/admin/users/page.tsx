"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Users, Trash2, Mail, Phone, User, Shield,
  Loader2, RefreshCw, Search, Filter, AlertCircle
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import DataTable from "@/app/components/admin/DataTable";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      console.log("👥 Users fetched:", response.data);
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to load users", { icon: "❌" });
      setLoading(false);
    }
  };

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== "ALL") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query)
      );
    }

    setFilteredUsers(filtered);
  }, [selectedRole, searchQuery, users]);

  const handleDeleteClick = (user: User) => {
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: user.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;

    setDeleting(true);

    try {
      await api.delete(`/admin/users/${deleteModal.userId}`);
      console.log("✅ User deleted");
      toast.success(`User "${deleteModal.userName}" deleted successfully`, {
        icon: "🗑️",
      });

      // Remove from local state
      setUsers(users.filter((u) => u.id !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete user",
        { icon: "❌" }
      );
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "CONSUMER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "SUPPLIER":
        return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      case "ADMIN":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "CONSUMER":
        return <User className="w-4 h-4" />;
      case "SUPPLIER":
        return <Users className="w-4 h-4" />;
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="User Management" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {filteredUsers.length} User{filteredUsers.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage platform users and permissions
            </p>
          </div>

          <motion.button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Filter by Role
              </label>
              <div className="flex flex-wrap gap-3">
                {["ALL", "CONSUMER", "SUPPLIER", "ADMIN"].map((role) => (
                  <motion.button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedRole === role
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">All Users</h3>
          </div>

          <div className="p-6">
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Name",
                  width: "col-span-3",
                },
                {
                  key: "email",
                  label: "Email",
                  width: "col-span-3",
                },
                {
                  key: "phone",
                  label: "Phone",
                  width: "col-span-2",
                },
                {
                  key: "role",
                  label: "Role",
                  width: "col-span-2",
                  render: (value) => (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${getRoleColor(
                        value
                      )}`}
                    >
                      {getRoleIcon(value)}
                      {value}
                    </span>
                  ),
                },
                {
                  key: "id",
                  label: "Actions",
                  width: "col-span-2",
                  render: (value, row) => (
                    <motion.button
                      onClick={() => handleDeleteClick(row)}
                      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-semibold flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  ),
                },
              ]}
              data={filteredUsers}
              loading={loading}
            />
          </div>
        </motion.div>

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800"
          >
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setDeleteModal({ isOpen: false, userId: null, userName: "" })}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Delete User?
              </h2>

              <p className="text-slate-400 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">"{deleteModal.userName}"</span>?
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <motion.button
                  onClick={() =>
                    setDeleteModal({ isOpen: false, userId: null, userName: "" })
                  }
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}