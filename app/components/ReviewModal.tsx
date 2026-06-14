"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import RatingStars from "./RatingStars";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number;
    supplier: {
      id: number;
      company_name: string;
    };
    quantity: number;
  };
  consumer: {
    id: number;
  };
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  booking,
  consumer,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating", { icon: "⭐" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        stars: rating,
        comment: comment.trim() || null,
      };

      const response = await api.post(
        `/rating?consumerId=${consumer.id}&supplierId=${booking.supplier.id}`,
        payload
      );

      console.log("✅ Review submitted:", response.data);

      toast.success("🌟 Thank you for your feedback!", {
        duration: 3000,
      });

      // Reset form
      setRating(0);
      setComment("");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Review error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit review",
        { icon: "❌" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-6 pt-10 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Rate Your Experience
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {booking.supplier.company_name}
                </p>
              </div>

              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Supplier Info */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
              >
                <p className="text-slate-400 text-sm mb-2">Booking Details</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">
                    {booking.supplier.company_name}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {booking.quantity} units
                  </span>
                </div>
              </motion.div>

              {/* Star Rating */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center py-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
              >
                <p className="text-white font-semibold mb-4">How would you rate this?</p>
                <RatingStars
                  value={rating}
                  onChange={setRating}
                  size="lg"
                />
              </motion.div>

              {/* Comment */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Your Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience... (max 500 characters)"
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none h-24"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {comment.length}/500 characters
                </p>
              </motion.div>

              {/* Rating Scale Help Text */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-slate-400 space-y-1"
              >
                <p className="font-semibold text-blue-300">Rating Scale:</p>
                <p>⭐ Poor - 1★ | Fair - 2★ | Good - 3★ | Very Good - 4★ | Excellent - 5★</p>
              </motion.div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Review
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}