"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Package, Calendar, MapPin, Truck, DollarSign,
  Star, Clock, CheckCircle, XCircle, Loader2,
  RefreshCw, CreditCard,
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import { TableSkeleton } from "@/app/components/dashboard/LoadingSkeleton";
import Link from "next/link";
import ReviewModal from "@/app/components/ReviewModal";

interface Booking {
  id: number;
  booking_date: string;
  quantity: number;
  status: string;
  supplier: {
    id: number;
    company_name: string;
    service_area: string;
    user: {
      phone: string;
    };
    // ✅ FIX 1: supplier_type included so price_per_gallon is available
    supplier_type?: {
      price_per_gallon: number;
    };
  };
  payment?: {
    id: number;
    amount: number;
    status: string;
    method: string;
  };
}

export default function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [consumerId, setConsumerId] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });

  // ✅ FIX 1: Computed at render time from selectedBooking — no editable state
  const computedAmount = selectedBooking
    ? selectedBooking.quantity *
      (selectedBooking.supplier.supplier_type?.price_per_gallon ?? 0)
    : 0;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setConsumerId(user.id);
    }
  }, []);

  useEffect(() => {
    if (consumerId) {
      fetchBookings();
    }
  }, [consumerId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/booking/lookup/consumer/${consumerId}`);
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
      setFilteredBookings(bookings.filter((b) => b.status === selectedStatus));
    }
  }, [selectedStatus, bookings]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePayment = async () => {
    // ✅ FIX 1: Validate using computedAmount, not a user-entered value
    if (!selectedBooking || computedAmount <= 0) {
      toast.error("Could not calculate payment amount. Please try again.", {
        icon: "⚠️",
      });
      return;
    }

    setPaymentLoading(true);

    try {
      // ✅ FIX 1: Send computed amount — consumer cannot change it
      const payload = {
        method: paymentMethod,
        amount: computedAmount,
      };

      const response = await api.post(
        `/payment?consumerId=${consumerId}&supplierId=${selectedBooking.supplier.id}&bookingId=${selectedBooking.id}`,
        payload
      );

      console.log("✅ Payment created:", response.data);

      // ✅ FIX 2: Immediately mark payment as PAID after creation
      const paymentId = response.data.payment?.id;
      if (paymentId) {
        await api.put(`/payment/${paymentId}`, { status: "PAID" });
        console.log("✅ Payment marked as PAID");
      }

      toast.success("💳 Payment confirmed!", { duration: 3000 });

      setShowPaymentModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error: any) {
      console.error("❌ Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed", {
        icon: "❌",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleOpenPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentMethod("cash");
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setPaymentMethod("cash");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="My Bookings" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {filteredBookings.length} Booking
              {filteredBookings.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage your water delivery orders
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
          {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "REJECTED"].map(
            (status) => (
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
            )
          )}
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
            <p className="text-slate-400 mb-6">
              {selectedStatus === "ALL"
                ? "Start by searching for water suppliers"
                : `No ${selectedStatus.toLowerCase()} bookings`}
            </p>
            {selectedStatus === "ALL" && (
              <Link href="/consumer/search">
                <motion.button
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search Suppliers
                </motion.button>
              </Link>
            )}
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
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-7 h-7 text-cyan-400" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {booking.supplier.company_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.booking_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {booking.quantity} gallon
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.supplier.service_area}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </div>

                    {/* ✅ FIX 1: Show price per gallon if available and no payment yet */}
                    {booking.supplier.supplier_type?.price_per_gallon &&
                      !booking.payment && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 mb-3">
                          <DollarSign className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm text-slate-300">
                            Price:{" "}
                            <span className="text-white font-semibold">
                              Rs.{" "}
                              {booking.supplier.supplier_type.price_per_gallon.toFixed(
                                2
                              )}{" "}
                              / gallon
                            </span>{" "}
                            · Total:{" "}
                            <span className="text-green-400 font-bold">
                              Rs.{" "}
                              {(
                                booking.quantity *
                                booking.supplier.supplier_type.price_per_gallon
                              ).toFixed(2)}
                            </span>
                          </span>
                        </div>
                      )}

                    {/* Payment Info */}
                    {booking.payment && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 mb-3">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">
                          Payment: Rs. {booking.payment.amount} (
                          {booking.payment.method}) —{" "}
                          <span
                            className={
                              booking.payment.status === "PAID"
                                ? "text-green-400 font-semibold"
                                : booking.payment.status === "PENDING"
                                ? "text-yellow-400 font-semibold"
                                : "text-red-400 font-semibold"
                            }
                          >
                            {booking.payment.status}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {booking.status === "ACCEPTED" && !booking.payment && (
                        <motion.button
                          onClick={() => handleOpenPaymentModal(booking)}
                          className="px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 text-sm font-semibold flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </motion.button>
                      )}

                      {booking.status === "COMPLETED" && (
                        <motion.button
                          onClick={() =>
                            setReviewModal({ isOpen: true, booking })
                          }
                          className="px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-sm font-semibold flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Star className="w-4 h-4" />
                          Rate
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={handleClosePaymentModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Confirm Payment
              </h2>

              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Supplier</p>
                  <p className="text-white font-semibold">
                    {selectedBooking.supplier.company_name}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Quantity</p>
                  <p className="text-white font-semibold">
                    {selectedBooking.quantity} gallon
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-slate-400 text-sm">Rate</p>
                  <p className="text-white font-semibold">
                    Rs.{" "}
                    {selectedBooking.supplier.supplier_type?.price_per_gallon?.toFixed(
                      2
                    ) ?? "N/A"}{" "}
                    / gallon
                  </p>
                </div>

                {/* ✅ FIX 1: Read-only computed total — not editable by consumer */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <p className="text-slate-400 text-sm">Total Amount</p>
                  <p className="text-green-400 font-bold text-2xl">
                    Rs. {computedAmount.toFixed(2)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {selectedBooking.quantity} ×{" "}
                    {selectedBooking.supplier.supplier_type?.price_per_gallon?.toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online Transfer</option>
                </select>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleClosePaymentModal}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handlePayment}
                  disabled={paymentLoading || computedAmount <= 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {paymentLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    `Pay Rs. ${computedAmount.toFixed(2)}`
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {reviewModal.booking && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={() => setReviewModal({ isOpen: false, booking: null })}
          booking={reviewModal.booking}
          consumer={{ id: parseInt(consumerId) }}
          onSuccess={() => fetchBookings()}
        />
      )}
    </div>
  );
}