"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Clock, CheckCircle, DollarSign,
  TrendingUp, Calendar, MapPin, Truck,
  ArrowRight, Search, Star, AlertCircle,
  Loader2, RefreshCw
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
    user: {
      phone: string;
    };
  };
  payment?: {
    amount: number;
    status: string;
  };
}

export default function ConsumerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [consumerId, setConsumerId] = useState<string>("");
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  // Recent bookings
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  // Fetch user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setConsumerId(parsedUser.id);
    }
  }, []);

  // Fetch bookings
  useEffect(() => {
    if (!consumerId) return;
    fetchBookings();
  }, [consumerId]);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await api.get(
        `/booking/lookup/consumer/${consumerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📦 Bookings fetched:", response.data);

      const bookings = response.data.bookings || [];
      
      // Calculate stats
      const totalBookings = bookings.length;
      const pending = bookings.filter((b: Booking) => b.status === "PENDING").length;
      const accepted = bookings.filter((b: Booking) => b.status === "ACCEPTED").length;
      const completed = bookings.filter((b: Booking) => b.status === "COMPLETED").length;

      setStats({
        total: totalBookings,
        pending,
        accepted,
        completed,
      });

      // Get recent 5 bookings
      setRecentBookings(bookings.slice(0, 5));
      
      setStatsLoading(false);
      setBookingsLoading(false);
      setLoading(false);

    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error(
        error.response?.data?.message || "Failed to load bookings",
        { icon: "❌" }
      );
      setStatsLoading(false);
      setBookingsLoading(false);
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
                title="Pending"
                value={stats.pending}
                icon={Clock}
                gradient="from-yellow-500 to-orange-600"
                delay={0.1}
              />
              <StatsCard
                title="Accepted"
                value={stats.accepted}
                icon={TrendingUp}
                gradient="from-blue-500 to-indigo-600"
                delay={0.2}
              />
              <StatsCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
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
          {/* Search Suppliers Card */}
          <Link href="/consumer/search">
            <motion.div
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Search className="w-7 h-7 text-white" />
                  </motion.div>
                  <ArrowRight className="w-6 h-6 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Search Suppliers
                </h3>
                <p className="text-slate-400 text-sm">
                  Find water suppliers in your area and book instantly
                </p>
              </div>
            </motion.div>
          </Link>

          {/* My Bookings Card */}
          <Link href="/consumer/bookings">
            <motion.div
              className="group relative p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer overflow-hidden"
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Package className="w-7 h-7 text-white" />
                  </motion.div>
                  <ArrowRight className="w-6 h-6 text-violet-400 group-hover:translate-x-2 transition-transform" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  My Bookings
                </h3>
                <p className="text-slate-400 text-sm">
                  View and manage all your water delivery bookings
                </p>
              </div>
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
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Recent Bookings
              </h2>
              <p className="text-slate-400 text-sm">
                Your latest water delivery orders
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
              
              <Link href="/consumer/bookings">
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

          {/* Bookings List */}
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
                  No Bookings Yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start by searching for water suppliers in your area
                </p>
                <Link href="/consumer/search">
                  <motion.button
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Search Suppliers
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div
                        className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Truck className="w-6 h-6 text-cyan-400" />
                      </motion.div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-bold truncate">
                            {booking.supplier.company_name}
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
                            {booking.supplier.service_area}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {booking.status === "ACCEPTED" && !booking.payment && (
                          <Link href={`/consumer/bookings`}>
                            <motion.button
                              className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-sm font-semibold"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Pay Now
                            </motion.button>
                          </Link>
                        )}
                        
                        {booking.status === "COMPLETED" && (
                          <Link href={`/consumer/reviews`}>
                            <motion.button
                              className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-sm font-semibold flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Star className="w-4 h-4" />
                              Rate
                            </motion.button>
                          </Link>
                        )}

                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
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