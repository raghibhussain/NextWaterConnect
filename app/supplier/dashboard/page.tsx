"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, DollarSign, Star, TrendingUp,
  Calendar, MapPin, Phone, CheckCircle,
  Clock, XCircle, Loader2, RefreshCw,
  User, Eye
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
  consumer: {
    full_name: string;
    address: string;
    user: {
      phone: string;
      email: string;
    };
  };
}

export default function SupplierDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [supplierId, setSupplierId] = useState<string>("");
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    revenue: 0,
    rating: 0,
  });

  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setSupplierId(parsedUser.id);
    }
  }, []);

  useEffect(() => {
    if (!supplierId) return;
    fetchData();
  }, [supplierId]);

  const fetchData = async () => {
    await Promise.all([
      fetchBookings(),
      fetchRatings(),
      fetchRevenue(),
    ]);
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await api.get(
        `/booking/lookup/supplier/${supplierId}`
      );

      console.log("📦 Bookings fetched:", response.data);

      const bookings = response.data.bookings || [];
      
      const totalBookings = bookings.length;
      const pending = bookings.filter((b: Booking) => b.status === "PENDING").length;
      const accepted = bookings.filter((b: Booking) => b.status === "ACCEPTED").length;
      const completed = bookings.filter((b: Booking) => b.status === "COMPLETED").length;

      setStats(prev => ({
        ...prev,
        total: totalBookings,
        pending,
        accepted,
        completed,
      }));

      setRecentBookings(bookings.slice(0, 5));
      setStatsLoading(false);
      setBookingsLoading(false);

    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error("Failed to load bookings", { icon: "❌" });
      setStatsLoading(false);
      setBookingsLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/rating/supplier/${supplierId}`);
      console.log("⭐ Ratings fetched:", response.data);
      
      setStats(prev => ({
        ...prev,
        rating: response.data.summary.average_stars || 0,
      }));
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchRevenue = async () => {
    try {
      // Calculate revenue from completed bookings with paid payments
      // This is a placeholder - you might need a dedicated endpoint
      setStats(prev => ({
        ...prev,
        revenue: 0, // Will be calculated from payments
      }));
    } catch (error) {
      console.error("Error fetching revenue:", error);
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
      <Navbar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Bookings"
                value={stats.total}
                icon={Package}
                gradient="from-cyan-500 to-blue-600"
                delay={0}
              />
              <StatsCard
                title="Pending Requests"
                value={stats.pending}
                icon={Clock}
                gradient="from-yellow-500 to-orange-600"
                delay={0.1}
              />
              <StatsCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
                delay={0.2}
              />
              <StatsCard
                title="Average Rating"
                value={stats.rating.toFixed(1)}
                icon={Star}
                gradient="from-amber-500 to-yellow-600"
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Link href="/supplier/bookings">
            <motion.div
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Package className="w-7 h-7 text-white" />
                  </motion.div>
                  {stats.pending > 0 && (
                    <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                      {stats.pending} New
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Manage Bookings
                </h3>
                <p className="text-slate-400 text-sm">
                  Accept or reject booking requests from customers
                </p>
              </div>
            </motion.div>
          </Link>

          <Link href="/supplier/vehicle">
            <motion.div
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <TrendingUp className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Vehicle Details
                </h3>
                <p className="text-slate-400 text-sm">
                  Update your vehicle information and pricing
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Recent Booking Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Recent Booking Requests
              </h2>
              <p className="text-slate-400 text-sm">
                Latest orders from customers
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                onClick={fetchBookings}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
              
              <Link href="/supplier/bookings">
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

          <div className="p-6">
            {bookingsLoading ? (
              <TableSkeleton />
            ) : recentBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Package className="w-10 h-10 text-slate-600" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No Booking Requests
                </h3>
                <p className="text-slate-400">
                  You'll see customer booking requests here
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <User className="w-6 h-6 text-cyan-400" />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold truncate">
                            {booking.consumer.full_name}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {booking.quantity} units
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.consumer.address}
                          </span>
                        </div>
                      </div>

                      <Link href="/supplier/bookings">
                        <motion.button
                          className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 text-sm font-semibold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </Link>
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