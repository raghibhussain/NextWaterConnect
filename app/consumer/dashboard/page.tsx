"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Clock, CheckCircle, TrendingUp,
  Calendar, MapPin, Truck, ArrowRight,
  Search, Star, Loader2, RefreshCw
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import StatsCard from "@/app/components/dashboard/StatsCard";
import { StatsCardSkeleton, TableSkeleton } from "@/app/components/dashboard/LoadingSkeleton";
import Link from "next/link";

interface Booking {
  id: number;
  booking_date: string;
  quantity: number;
  status: string;
  supplier: {
    company_name: string;
    service_area: string;
    user: { phone: string };
  };
  payment?: { amount: number; status: string };
}

export default function ConsumerDashboard() {
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [consumerId, setConsumerId] = useState<string>("");
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setConsumerId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!consumerId) return;
    fetchBookings();
  }, [consumerId]);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await api.get(`/booking/lookup/consumer/${consumerId}`);
      const bookings = response.data.bookings || [];
      setStats({
        total: bookings.length,
        pending: bookings.filter((b: Booking) => b.status === "PENDING").length,
        accepted: bookings.filter((b: Booking) => b.status === "ACCEPTED").length,
        completed: bookings.filter((b: Booking) => b.status === "COMPLETED").length,
      });
      setRecentBookings(bookings.slice(0, 5));
      setStatsLoading(false);
      setBookingsLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load bookings", { icon: "❌" });
      setStatsLoading(false);
      setBookingsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":   return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "ACCEPTED":  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "REJECTED":  return "bg-red-500/10 text-red-400 border-red-500/20";
      default:          return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Dashboard" />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {statsLoading ? (
            <><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /></>
          ) : (
            <>
              <StatsCard title="Total Bookings" value={stats.total} icon={Package} gradient="from-cyan-500 to-blue-600" delay={0} />
              <StatsCard title="Pending" value={stats.pending} icon={Clock} gradient="from-yellow-500 to-orange-600" delay={0.1} />
              <StatsCard title="Accepted" value={stats.accepted} icon={TrendingUp} gradient="from-blue-500 to-indigo-600" delay={0.2} />
              <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} gradient="from-green-500 to-emerald-600" delay={0.3} />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6"
        >
          <Link href="/consumer/search">
            <motion.div
              className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Search Suppliers</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Find water suppliers in your area and book instantly</p>
            </motion.div>
          </Link>

          <Link href="/consumer/bookings">
            <motion.div
              className="group relative p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-2 transition-transform" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">My Bookings</h3>
              <p className="text-slate-400 text-xs sm:text-sm">View and manage all your water delivery bookings</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-0.5">Recent Bookings</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Your latest water delivery orders</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                onClick={fetchBookings}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <Link href="/consumer/bookings">
                <motion.button
                  className="px-3 sm:px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all text-xs sm:text-sm font-semibold"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                  View All
                </motion.button>
              </Link>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {bookingsLoading ? (
              <TableSkeleton />
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <motion.div
                  className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Package className="w-10 h-10 text-slate-600" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">No Bookings Yet</h3>
                <p className="text-slate-400 mb-6">Start by searching for water suppliers in your area</p>
                <Link href="/consumer/search">
                  <motion.button
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    Search Suppliers
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-3 sm:p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {/* Name + badge — stacks on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5">
                          <h4 className="text-white font-bold text-sm sm:text-base truncate">
                            {booking.supplier.company_name}
                          </h4>
                          <span className={`self-start flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>

                        {/* Meta — wraps on mobile */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 flex-shrink-0" />
                            {booking.quantity} gal
                          </span>
                          <span className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{booking.supplier.service_area}</span>
                          </span>
                        </div>
                      </div>

                      {/* Action + arrow */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        {booking.status === "ACCEPTED" && !booking.payment && (
                          <Link href="/consumer/bookings">
                            <motion.button
                              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs sm:text-sm font-semibold whitespace-nowrap"
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                              Pay
                            </motion.button>
                          </Link>
                        )}
                        {booking.status === "COMPLETED" && (
                          <Link href="/consumer/reviews">
                            <motion.button
                              className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs sm:text-sm font-semibold flex items-center gap-1"
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Rate</span>
                            </motion.button>
                          </Link>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}