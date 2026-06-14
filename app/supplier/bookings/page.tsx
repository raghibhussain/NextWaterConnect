"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Calendar, MapPin, User, Phone,
  CheckCircle, XCircle, Clock, Loader2,
  RefreshCw, Check, X, DollarSign
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import { TableSkeleton } from "@/app/components/dashboard/LoadingSkeleton";

interface Booking {
  id: number;
  booking_date: string;
  quantity: number;
  status: string;
  consumer: {
    full_name: string;
    address: string;
    user: { phone: string; email: string };
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    method: string;
  };
}

export default function SupplierBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [supplierId, setSupplierId] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setSupplierId(JSON.parse(userData).id);
  }, []);

  useEffect(() => {
    if (supplierId) fetchBookings();
  }, [supplierId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/booking/lookup/supplier/${supplierId}`);
      const bookingsData = response.data.bookings || [];
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error: any) {
      toast.error("Failed to load bookings", { icon: "❌" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredBookings(
      selectedStatus === "ALL" ? bookings : bookings.filter((b) => b.status === selectedStatus)
    );
  }, [selectedStatus, bookings]);

  const handleAction = async (bookingId: number, action: "accept" | "reject" | "complete") => {
    setActionLoading(bookingId);
    try {
      await api.put(`/booking/${bookingId}/${action}?supplierId=${supplierId}`);
      const actionText = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "completed";
      toast.success(`Booking ${actionText} successfully!`, { icon: "✅" });

      if (action === "complete") {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.payment?.id) {
          try {
            await api.put(`/payment/${booking.payment.id}`, { status: "PAID" });
          } catch { }
        }
      }
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} booking`, { icon: "❌" });
    } finally {
      setActionLoading(null);
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
      <Navbar title="Manage Bookings" />

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {filteredBookings.length} Booking{filteredBookings.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">Manage customer booking requests</p>
          </div>
          <motion.button
            onClick={fetchBookings}
            className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white transition-all text-sm"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        </motion.div>

        {/* Status Filter — horizontal scroll on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide"
        >
          {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"].map((status) => (
            <motion.button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                selectedStatus === status
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
              }`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              {status}
            </motion.button>
          ))}
        </motion.div>

        {/* Bookings List */}
        {loading ? (
          <TableSkeleton />
        ) : filteredBookings.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No bookings found</h3>
            <p className="text-slate-400">
              {selectedStatus === "ALL" ? "You don't have any bookings yet" : `No ${selectedStatus.toLowerCase()} bookings`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4">

                  {/* Icon */}
                  <div className="hidden sm:flex w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-cyan-400" />
                  </div>

                  <div className="flex-1 min-w-0">

                    {/* Name + status badge — stacks on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <h3 className="text-base sm:text-lg font-bold text-white truncate">
                        {booking.consumer.full_name}
                      </h3>
                      <span className={`self-start flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                        {booking.status === "PENDING"   && <Clock className="w-3.5 h-3.5" />}
                        {booking.status === "ACCEPTED"  && <CheckCircle className="w-3.5 h-3.5" />}
                        {booking.status === "COMPLETED" && <CheckCircle className="w-3.5 h-3.5" />}
                        {booking.status === "REJECTED"  && <XCircle className="w-3.5 h-3.5" />}
                        {booking.status}
                      </span>
                    </div>

                    {/* Meta info — wraps on mobile */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDate(booking.booking_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 flex-shrink-0" />
                        {booking.quantity} gallons
                      </span>
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{booking.consumer.address}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                        {booking.consumer.user.phone}
                      </span>
                    </div>

                    {/* Payment info */}
                    {booking.payment && (
                      <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="text-slate-400 text-xs sm:text-sm flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            Payment
                          </span>
                          <span className="text-green-400 font-bold text-sm sm:text-base">
                            Rs. {booking.payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {booking.payment.method} ·{" "}
                          <span className="text-cyan-400 font-semibold">{booking.payment.status}</span>
                        </p>
                      </div>
                    )}

                    {/* Action buttons — wrap on mobile */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {booking.status === "PENDING" && (
                        <>
                          <motion.button
                            onClick={() => handleAction(booking.id, "accept")}
                            disabled={actionLoading === booking.id}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-xs sm:text-sm font-semibold disabled:opacity-50"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === booking.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Check className="w-4 h-4" />}
                            Accept
                          </motion.button>
                          <motion.button
                            onClick={() => handleAction(booking.id, "reject")}
                            disabled={actionLoading === booking.id}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-xs sm:text-sm font-semibold disabled:opacity-50"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === booking.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <X className="w-4 h-4" />}
                            Reject
                          </motion.button>
                        </>
                      )}

                      {booking.status === "ACCEPTED" && (
                        <motion.button
                          onClick={() => handleAction(booking.id, "complete")}
                          disabled={actionLoading === booking.id}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-xs sm:text-sm font-semibold disabled:opacity-50"
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading === booking.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <CheckCircle className="w-4 h-4" />}
                          <span className="hidden sm:inline">Complete & Finalize Payment</span>
                          <span className="sm:hidden">Complete</span>
                        </motion.button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs sm:text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}

                      {booking.status === "REJECTED" && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs sm:text-sm font-semibold">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}