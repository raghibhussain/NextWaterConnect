"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Calendar, MapPin, User, Phone,
  CheckCircle, XCircle, Clock, Loader2,
  RefreshCw, Eye, Check, X, AlertCircle,
  DollarSign
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
    user: {
      phone: string;
      email: string;
    };
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
    if (userData) {
      const user = JSON.parse(userData);
      setSupplierId(user.id);
    }
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchBookings();
    }
  }, [supplierId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/booking/lookup/supplier/${supplierId}`
      );

      console.log("📦 Bookings:", response.data);
      const bookingsData = response.data.bookings || [];
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error("Failed to load bookings", { icon: "❌" });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStatus === "ALL") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(
        bookings.filter((b) => b.status === selectedStatus)
      );
    }
  }, [selectedStatus, bookings]);

  const handleAction = async (
    bookingId: number,
    action: "accept" | "reject" | "complete"
  ) => {
    setActionLoading(bookingId);

    try {
      const response = await api.put(
        `/booking/${bookingId}/${action}?supplierId=${supplierId}`
      );

      console.log(`✅ Booking ${action}ed:`, response.data);

      const actionText = action === "accept" ? "accepted" : action === "reject" ? "rejected" : "completed";
      toast.success(`Booking ${actionText} successfully!`, { icon: "✅" });

      // If completing, also update payment to PAID
      if (action === "complete") {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking?.payment?.id) {
          try {
            await api.put(`/payment/${booking.payment.id}`, {
              status: "PAID",
            });
            toast.success("Payment finalized! ✅", { icon: "💳" });
          } catch (paymentError) {
            console.warn("Payment update warning:", paymentError);
          }
        }
      }

      fetchBookings();
    } catch (error: any) {
      console.error(`❌ Error ${action}ing booking:`, error);
      toast.error(
        error.response?.data?.message || `Failed to ${action} booking`,
        { icon: "❌" }
      );
    } finally {
      setActionLoading(null);
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
      <Navbar title="Manage Bookings" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {filteredBookings.length} Booking{filteredBookings.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage customer booking requests
            </p>
          </div>

          <motion.button
            onClick={fetchBookings}
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

        {/* Bookings List */}
        {loading ? (
          <TableSkeleton />
        ) : filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No bookings found
            </h3>
            <p className="text-slate-400">
              {selectedStatus === "ALL"
                ? "You don't have any bookings yet"
                : `No ${selectedStatus.toLowerCase()} bookings`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Customer Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-cyan-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {booking.consumer.full_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {booking.quantity} gallons
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.consumer.address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-green-400" />
                            {booking.consumer.user.phone}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Payment Display - HERE IS WHERE TO ADD IT */}
                    {booking.payment && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">💰 Payment Amount:</span>
                          <span className="text-green-400 font-bold">
                            Rs. {booking.payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Status: <span className="text-cyan-400 font-semibold">{booking.payment.status}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      {booking.status === "PENDING" && (
                        <>
                          <motion.button
                            onClick={() => handleAction(booking.id, "accept")}
                            disabled={actionLoading === booking.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-sm font-semibold disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Accept
                          </motion.button>

                          <motion.button
                            onClick={() => handleAction(booking.id, "reject")}
                            disabled={actionLoading === booking.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm font-semibold disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            Reject
                          </motion.button>
                        </>
                      )}

                      {booking.status === "ACCEPTED" && (
                        <motion.button
                          onClick={() => handleAction(booking.id, "complete")}
                          disabled={actionLoading === booking.id}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-semibold disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {actionLoading === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Complete & Finalize Payment
                        </motion.button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}

                      {booking.status === "REJECTED" && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold">
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