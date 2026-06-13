"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Star, User, Calendar, Loader2, TrendingUp,
  Award
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";

interface Rating {
  id: number;
  stars: number;
  comment: string | null;
  consumer: {
    full_name: string;
    user: {
      name: string;
    };
  };
}

export default function SupplierReviews() {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState({
    total_ratings: 0,
    average_stars: 0,
    star_distribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });
  const [supplierId, setSupplierId] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setSupplierId(user.id);
    }
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchRatings();
    }
  }, [supplierId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rating/supplier/${supplierId}`);
      
      console.log("⭐ Ratings:", response.data);
      setRatings(response.data.ratings || []);
      setSummary(response.data.summary);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching ratings:", error);
      toast.error("Failed to load ratings", { icon: "❌" });
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Reviews & Ratings" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Reviews & Ratings" />

      <main className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Star className="w-12 h-12 text-amber-400 fill-amber-400" />
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2">
              {summary.average_stars.toFixed(1)}
            </h3>
            <p className="text-slate-400 text-sm">Average Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2">
              {summary.total_ratings}
            </h3>
            <p className="text-slate-400 text-sm">Total Reviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800"
          >
            <h3 className="text-white font-bold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm w-4">{star}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${
                          summary.total_ratings > 0
                            ? (summary.star_distribution[star as keyof typeof summary.star_distribution] /
                                summary.total_ratings) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-8">
                    {summary.star_distribution[star as keyof typeof summary.star_distribution]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">
            Customer Reviews ({ratings.length})
          </h2>

          {ratings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                No reviews yet
              </h3>
              <p className="text-slate-400">
                Complete bookings to receive customer reviews
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating, index) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-bold">
                          {rating.consumer.full_name}
                        </h4>
                        {renderStars(rating.stars || 0)}
                      </div>

                      {rating.comment && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-2">
                          "{rating.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}