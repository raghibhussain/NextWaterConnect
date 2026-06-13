"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Store, MapPin, Star, Truck, Loader2,
  RefreshCw, Search, Filter, Award
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import DataTable from "@/app/components/admin/DataTable";

interface Supplier {
  id: number;
  company_name: string;
  service_area: string;
  user: {
    name: string;
    phone: string;
  };
  supplier_type?: {
    category: string;
  };
  stats?: {
    total_bookings: number;
    completed_bookings: number;
    total_ratings: number;
    average_rating: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function AdminSuppliers() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });
  const [searchArea, setSearchArea] = useState("");

  useEffect(() => {
    fetchSuppliers(1);
  }, []);

  const fetchSuppliers = async (page: number, area?: string) => {
    try {
      setLoading(true);
      const areaParam = area || searchArea;
      const response = await api.get(
        `/admin/suppliers?${areaParam ? `area=${encodeURIComponent(areaParam)}&` : ""}page=${page}&limit=10`
      );

      console.log("🏢 Suppliers fetched:", response.data);
      setSuppliers(response.data.suppliers);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching suppliers:", error);
      toast.error("Failed to load suppliers", { icon: "❌" });
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSuppliers(1, searchArea);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
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
      <Navbar title="Suppliers Management" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">
              {pagination.total} Supplier{pagination.total !== 1 ? "s" : ""}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Manage water supply partners
            </p>
          </div>

          <motion.button
            onClick={() => fetchSuppliers(pagination.page)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Search Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
        >
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by area..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <motion.button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="w-5 h-5" />
              Search
            </motion.button>
          </div>
        </motion.div>

        {/* Suppliers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white">All Suppliers</h3>
          </div>

          <div className="p-6">
            <DataTable
              columns={[
                {
                  key: "company_name",
                  label: "Company",
                  width: "col-span-2",
                },
                {
                  key: "service_area",
                  label: "Service Area",
                  width: "col-span-2",
                },
                {
                  key: "supplier_type",
                  label: "Category",
                  width: "col-span-1",
                  render: (value) => (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {value?.category || "N/A"}
                    </span>
                  ),
                },
                {
                  key: "stats",
                  label: "Rating",
                  width: "col-span-1",
                  render: (value) => (
                    <div className="flex items-center gap-1">
                      {renderStars(value?.average_rating || 0)}
                      <span className="text-xs text-slate-400 ml-1">
                        ({value?.total_ratings || 0})
                      </span>
                    </div>
                  ),
                },
                {
                  key: "stats",
                  label: "Bookings",
                  width: "col-span-1",
                  render: (value) => (
                    <span className="text-sm font-semibold text-cyan-400">
                      {value?.total_bookings || 0}
                    </span>
                  ),
                },
                {
                  key: "user",
                  label: "Contact",
                  width: "col-span-2",
                  render: (value) => value?.phone || "N/A",
                },
              ]}
              data={suppliers}
              loading={loading}
                pagination={{
                  total: pagination.total,
                  page: pagination.page,
                  limit: pagination.limit,
                  totalPages: pagination.total_pages,
                  onPageChange: (page) => fetchSuppliers(page),
                }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}