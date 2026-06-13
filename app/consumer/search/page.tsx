"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Search, MapPin, Truck, Star, Phone, ArrowRight,
  Filter, Loader2, Package, DollarSign, AlertCircle,
  TrendingUp, Award, CheckCircle, X
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import Link from "next/link";

interface Supplier {
  id: number;
  company_name: string;
  service_area: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  supplier_type?: {
    category: string;
    vehicle_no: string;
  };
  stats?: {
    average_rating: number;
    total_ratings: number;
  };
}

export default function SearchSuppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // Get user's area from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.consumer?.address) {
        setArea(user.consumer.address);
      }
    }
  }, []);

  // Search suppliers
  const handleSearch = async () => {
    if (!area.trim()) {
      toast.error("Please enter an area to search", { icon: "📍" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(
        `/supplier/search/area/${encodeURIComponent(area)}`
      );

      console.log("🔍 Search results:", response.data);

      const suppliersData = response.data.suppliers || [];

      // Fetch ratings for each supplier
      const suppliersWithRatings = await Promise.all(
        suppliersData.map(async (supplier: Supplier) => {
          try {
            const ratingResponse = await api.get(
              `/rating/supplier/${supplier.id}`
            );
            return {
              ...supplier,
              stats: ratingResponse.data.summary,
            };
          } catch (error) {
            return {
              ...supplier,
              stats: { average_rating: 0, total_ratings: 0 },
            };
          }
        })
      );

      setSuppliers(suppliersWithRatings);
      setFilteredSuppliers(suppliersWithRatings);

      if (suppliersWithRatings.length === 0) {
        toast.error(`No suppliers found in ${area}`, { icon: "😔" });
      } else {
        toast.success(
          `Found ${suppliersWithRatings.length} supplier(s) in ${area}`,
          { icon: "✅" }
        );
      }
    } catch (error: any) {
      console.error("❌ Search error:", error);
      toast.error(
        error.response?.data?.message || "Failed to search suppliers",
        { icon: "❌" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter by category
  useEffect(() => {
    if (selectedCategory === "ALL") {
      setFilteredSuppliers(suppliers);
    } else {
      setFilteredSuppliers(
        suppliers.filter(
          (s) => s.supplier_type?.category === selectedCategory
        )
      );
    }
  }, [selectedCategory, suppliers]);

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Search Suppliers" />

      <main className="flex-1 p-6 space-y-6">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 p-8"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-3xl font-black text-white mb-2">
                Find Water Suppliers Near You
              </h1>
              <p className="text-slate-400">
                Search by area to find trusted water delivery services
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter area (e.g., Gulshan, Karachi)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <motion.button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filters & Results Count */}
        {suppliers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-white">
                {filteredSuppliers.length} Supplier
                {filteredSuppliers.length !== 1 ? "s" : ""} Found
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                in {area}
              </p>
            </div>

            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? (
                <X className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && suppliers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 rounded-xl border border-slate-800 p-6"
            >
              <h3 className="text-white font-bold mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-3">
                {["ALL", "Tanker", "Drinking Water"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suppliers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
              >
                <div className="w-full h-40 bg-slate-800 rounded-xl mb-4" />
                <div className="w-3/4 h-6 bg-slate-800 rounded mb-2" />
                <div className="w-1/2 h-4 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 && suppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-12 h-12 text-slate-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Start Your Search
            </h3>
            <p className="text-slate-400 mb-6">
              Enter your area above to find water suppliers near you
            </p>
          </motion.div>
        ) : filteredSuppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No suppliers found in this category
            </h3>
            <p className="text-slate-400">
              Try selecting a different category filter
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all overflow-hidden"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Background Gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                />

                {/* Top Badge */}
                {supplier.supplier_type && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                      {supplier.supplier_type.category}
                    </span>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Company Logo/Icon */}
                  <motion.div
                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-cyan-500/25"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {supplier.company_name.charAt(0).toUpperCase()}
                  </motion.div>

                  {/* Company Name */}
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {supplier.company_name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-slate-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{supplier.service_area}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(
                      Math.round(supplier.stats?.average_rating || 0)
                    )}
                    <span className="text-slate-400 text-sm">
                      {supplier.stats?.average_rating?.toFixed(1) || "0.0"} (
                      {supplier.stats?.total_ratings || 0} reviews)
                    </span>
                  </div>

                  {/* Vehicle Info */}
                  {supplier.supplier_type && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-4 p-3 rounded-lg bg-slate-800/50">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <span>Vehicle: {supplier.supplier_type.vehicle_no}</span>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                    <Phone className="w-4 h-4 text-green-400" />
                    <span>{supplier.user.phone}</span>
                  </div>

                  {/* Book Now Button */}
                  <Link href={`/consumer/book/${supplier.id}`}>
                    <motion.button
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Book Now
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}