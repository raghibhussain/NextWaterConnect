"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Star, MessageSquare, Loader2, RefreshCw, Package,
  CheckCircle, AlertCircle
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import ReviewModal from "@/app/components/ReviewModal";
import RatingStars from "@/app/components/RatingStars";

interface CompletedBooking {
  id: number;
  booking_date: string;
  quantity: number;
  status: string;
  supplier: {
    id: number;
    company_name: string;
    service_area: string;
  };
}

interface Review {
  id: number;
  stars: number;
  comment: string | null;
  createdAt: string;
  supplier: {
    company_name: string;
  };
}

export default function ConsumerReviews() {
  const [loading, setLoading] = useState(true);
  const [consumerId, setConsumerId] = useState("");
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

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
      const response = await api.get(
        `/booking/lookup/consumer/${consumerId}`
      );

      const allBookings = response.data.bookings || [];
      
      // Filter completed bookings
      const completed = allBookings.filter(
        (b: any) => b.status === "COMPLETED"
      );
      
      setCompletedBookings(completed);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching bookings:", error);
      toast.error("Failed to load bookings", { icon: "❌" });
      setLoading(false);
    }
  };

  const handleOpenReviewModal = (booking: CompletedBooking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const ratedSuppliers = new Set(reviews.map(r => r.supplier.company_name));
  const pendingBookings = completedBookings.filter(
    b => !ratedSuppliers.has(b.supplier.company_name)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Reviews & Feedback" />

      <main className="flex-1 p-6 space-y-6">
        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 border-b border-slate-800"
        >
          <motion.button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-4 font-semibold text-sm transition-all relative ${
              activeTab === "pending"
                ? "text-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pending Reviews ({pendingBookings.length})
            {activeTab === "pending" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>

          <motion.button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-4 font-semibold text-sm transition-all relative ${
              activeTab === "completed"
                ? "text-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Your Reviews ({reviews.length})
            {activeTab === "completed" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        </motion.div>

        {/* Pending Reviews Tab */}
        {activeTab === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Loading bookings...</p>
              </div>
            ) : pendingBookings.length === 0 ? (
              <motion.div
                className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  All Caught Up!
                </h3>
                <p className="text-slate-400 mb-6">
                  You've reviewed all your completed bookings
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {booking.supplier.company_name}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {booking.supplier.service_area}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold">
                          Completed
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-800/50">
                        <div>
                          <p className="text-slate-400 text-xs">Quantity</p>
                          <p className="text-white font-bold">
                            {booking.quantity} units
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Date</p>
                          <p className="text-white font-bold">
                            {formatDate(booking.booking_date)}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.button
                        onClick={() => handleOpenReviewModal(booking)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Star className="w-5 h-5" />
                        Write Review
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Completed Reviews Tab */}
        {activeTab === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                <p className="text-slate-400 mt-4">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <motion.div
                className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800"
              >
                <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-slate-400">
                  Your reviews will appear here once you submit them
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {review.supplier.company_name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.stars
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-slate-300 leading-relaxed mb-2">
                        "{review.comment}"
                      </p>
                    )}

                    <div className="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                      {review.stars === 1
                        ? "⭐ Poor"
                        : review.stars === 2
                        ? "⭐⭐ Fair"
                        : review.stars === 3
                        ? "⭐⭐⭐ Good"
                        : review.stars === 4
                        ? "⭐⭐⭐⭐ Very Good"
                        : "⭐⭐⭐⭐⭐ Excellent"}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          consumer={{ id: parseInt(consumerId) }}
          onSuccess={() => {
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}