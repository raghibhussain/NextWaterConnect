"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  DollarSign, CreditCard, TrendingUp, Loader2,
  RefreshCw, ArrowDownUp
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import DataTable from "@/app/components/admin/DataTable";
import StatsCard from "@/app/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/app/components/dashboard/LoadingSkeleton";

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  consumer: {
    full_name: string;
  };
  supplier: {
    company_name: string;
  };
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface PaymentStats {
  total: number;
  pending: number;
  paid: number;
  failed: number;
  total_amount: number;
}

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    Promise.all([fetchStats(), fetchPayments(1)]);
  }, [selectedStatus]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const status = selectedStatus === "ALL" ? "" : selectedStatus;
      const response = await api.get(`/admin/payments?status=${status}&page=1&limit=10`);
      
      setStats({
        total: response.data.pagination?.total || 0,
        pending: 0,
        paid: 0,
        failed: 0,
        total_amount: response.data.total_amount || 0,
      });
      setStatsLoading(false);
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      setStatsLoading(false);
    }
  };

  const fetchPayments = async (page: number) => {
    try {
      setLoading(true);
      const status = selectedStatus === "ALL" ? "" : selectedStatus;
      const response = await api.get(
        `/admin/payments?status=${status}&page=${page}&limit=10`
      );

      console.log("💳 Payments fetched:", response.data);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching payments:", error);
      toast.error("Failed to load payments", { icon: "❌" });
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "PAID":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "FAILED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString("en-PK")}`;
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
      <Navbar title="Payments Management" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Payments"
              value={stats.total}
              icon={CreditCard}
              gradient="from-cyan-500 to-blue-600"
              delay={0}
            />
            <StatsCard
              title="Total Amount"
              value={formatCurrency(stats.total_amount)}
              icon={DollarSign}
              gradient="from-green-500 to-emerald-600"
              delay={0.1}
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={ArrowDownUp}
              gradient="from-yellow-500 to-orange-600"
              delay={0.2}
            />
            <StatsCard
              title="Completed"
              value={stats.paid}
              icon={TrendingUp}
              gradient="from-violet-500 to-purple-600"
              delay={0.3}
            />
          </div>
        ) : null}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {pagination.total} Payment{pagination.total !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Track and manage all payments
            </p>
          </div>

          <motion.button
            onClick={() => fetchPayments(pagination.page)}
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
          {["ALL", "PENDING", "PAID", "FAILED"].map((status) => (
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

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">All Payments</h3>
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
                  key: "amount",
                  label: "Amount",
                  width: "col-span-2",
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "method",
                  label: "Method",
                  width: "col-span-1",
                  render: (value) => (
                    <span className="capitalize px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                      {value}
                    </span>
                  ),
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
              data={payments}
              loading={loading}
                pagination={{
                  total: pagination.total,
                  page: pagination.page,
                  limit: pagination.limit,
                  totalPages: pagination.total_pages,
                  onPageChange: (page) => fetchPayments(page),
                }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}