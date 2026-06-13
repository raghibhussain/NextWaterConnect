"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Calendar, MapPin, User, Loader2,
  RefreshCw, Filter, Search
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import DataTable from "@/app/components/admin/DataTable";

interface Booking {
  id: number;
  booking_date: string;
  quantity: number;
  status: string;
  consumer: {
    full_name: string;
    address: string;
  };
  supplier: {
    company_name: string;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function AdminBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBookings(1);
  }, [selectedStatus]);

  const fetchBookings = async (page: number) => {
    try {
      setLoading(true);
      const status = selectedStatus === "ALL" ? "" : selectedStatus;
      const response = await api.get(
        `/admin/bookings?status=${status}&page=${page}&limit=10`
      );

      console.log("📦 Bookings fetched:", response.data);
      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error("Failed to load bookings", { icon: "❌" });
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "ACCEPTED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Bookings Management" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {pagination.total} Booking{pagination.total !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage all water delivery bookings
            </p>
          </div>

          <motion.button
            onClick={() => fetchBookings(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3"
        >
          {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"].map((status) => (
            <motion.button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
            </motion.button>
          ))}
        </motion.div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">All Bookings</h3>
          </div>

          <div className="p-6">
            <DataTable
              columns={[
                {
                  key: "id",
                  label: "ID",
                  width: "col-span-1",
                },
                {
                  key: "consumer",
                  label: "Customer",
                  width: "col-span-2",
                  render: (value) => value?.full_name || "N/A",
                },
                {
                  key: "supplier",
                  label: "Supplier",
                  width: "col-span-2",
                  render: (value) => value?.company_name || "N/A",
                },
                {
                  key: "booking_date",
                  label: "Date",
                  width: "col-span-2",
                  render: (value) => formatDate(value),
                },
                {
                  key: "quantity",
                  label: "Qty",
                  width: "col-span-1",
                  render: (value) => `${value} units`,
                },
                {
                  key: "status",
                  label: "Status",
                  width: "col-span-2",
                  render: (value) => (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        value
                      )}`}
                    >
                      {value}
                    </span>
                  ),
                },
              ]}
              data={bookings}
              loading={loading}
              pagination={{
                  total: pagination.total,
                  page: pagination.page,
                  limit: pagination.limit,
                  totalPages: pagination.total_pages,
                  onPageChange: (page) => fetchBookings(page),
                }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}