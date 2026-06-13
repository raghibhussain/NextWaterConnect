"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Users, Package, DollarSign, Star, TrendingUp,
  Calendar, MapPin, Clock, CheckCircle, Loader2,
  RefreshCw, AlertCircle, BarChart3, PieChart
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import StatsCard from "@/app/components/dashboard/StatsCard";
import { StatsCardSkeleton, TableSkeleton } from "@/app/components/dashboard/LoadingSkeleton";
import { BarChartComponent, PieChartComponent } from "@/app/components/admin/Charts";
import Link from "next/link";

interface DashboardStats {
  users: {
    total: number;
    consumers: number;
    suppliers: number;
  };
  bookings: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    rejected: number;
  };
  payments: {
    total: number;
    pending: number;
    paid: number;
    failed: number;
  };
  revenue: {
    total: number;
    average: number;
    highest: number;
    lowest: number;
  };
  ratings: {
    total: number;
    average: number;
  };
  recent: {
    bookings: any[];
    payments: any[];
  };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dashboard");
      console.log("📊 Dashboard stats:", response.data);
      setStats(response.data.dashboard);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching dashboard:", error);
      toast.error("Failed to load dashboard", { icon: "❌" });
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
      case "PAID":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "FAILED":
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

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString("en-PK")}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatsCard
                title="Total Users"
                value={stats.users.total}
                icon={Users}
                gradient="from-cyan-500 to-blue-600"
                delay={0}
              />
              <StatsCard
                title="Total Bookings"
                value={stats.bookings.total}
                icon={Package}
                gradient="from-violet-500 to-purple-600"
                delay={0.1}
              />
              {/* <StatsCard
                title="Revenue"
                value={formatCurrency(stats.revenue.total)}
                icon={DollarSign}
                gradient="from-green-500 to-emerald-600"
                delay={0.2}
              /> */}
              <StatsCard
                title="Avg Rating"
                value={stats.ratings.average.toFixed(1)}
                icon={Star}
                gradient="from-amber-500 to-yellow-600"
                delay={0.3}
              />
              <StatsCard
                title="Total Payments"
                value={stats.payments.total}
                icon={TrendingUp}
                gradient="from-rose-500 to-pink-600"
                delay={0.4}
              />
            </>
          ) : null}
        </div>

        {/* Charts Row */}
        {!loading && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Booking Status Chart */}
            <motion.div
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">Booking Status</h3>
              </div>
              <BarChartComponent
                data={[
                  { name: "Pending", value: stats.bookings.pending },
                  { name: "Accepted", value: stats.bookings.accepted },
                  { name: "Completed", value: stats.bookings.completed },
                  { name: "Rejected", value: stats.bookings.rejected },
                ]}
              />
            </motion.div>

            {/* Payment Status Pie Chart */}
            <motion.div
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-violet-400" />
                <h3 className="text-xl font-bold text-white">Payment Status</h3>
              </div>
              <PieChartComponent
                data={[
                  { name: "Pending", value: stats.payments.pending },
                  { name: "Paid", value: stats.payments.paid },
                  { name: "Failed", value: stats.payments.failed },
                ]}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Recent Activity */}
        {!loading && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Recent Bookings */}
            <motion.div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Recent Bookings
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Latest orders in system
                    </p>
                  </div>
                  <Link href="/admin/bookings">
                    <motion.button
                      className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-sm font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  </Link>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {stats.recent.bookings.slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">
                        {booking.consumer?.user?.name}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{formatDate(booking.booking_date)}</span>
                      <span>{booking.quantity} units</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Payments */}
            <motion.div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Recent Payments
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      Latest transactions
                    </p>
                  </div>
                  <Link href="/admin/payments">
                    <motion.button
                      className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-sm font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All
                    </motion.button>
                  </Link>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {stats.recent.payments.slice(0, 5).map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{payment.method}</span>
                      <span>{formatDate(payment.createdAt || new Date().toISOString())}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-pulse">
              <div className="w-1/2 h-6 bg-slate-800 rounded mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded" />
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 animate-pulse">
              <div className="w-1/2 h-6 bg-slate-800 rounded mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-slate-800 rounded" />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}