"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Truck, Package, Edit, Save, Loader2,
  AlertCircle, CheckCircle, Info, Bell
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";

export default function VehicleDetails() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_no: "",
    category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setSupplierId(user.id);
    }
  }, []);

  useEffect(() => {
    if (supplierId) {
      fetchVehicleDetails();
    }
  }, [supplierId]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Removed extra /api
      const response = await api.get(`/suppliertype/${supplierId}`);
      
      console.log("🚛 Vehicle details:", response.data);

      if (response.data.supplier_type) {
        setFormData({
          vehicle_no: response.data.supplier_type.vehicle_no || "",
          category: response.data.supplier_type.category || "",
        });
        setHasVehicle(true);
        setEditing(false);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching vehicle:", error);
      if (error.response?.status === 404) {
        setHasVehicle(false);
        setEditing(true); // Auto-open form if no vehicle exists
        toast("📋 Please add your vehicle details", {
              icon: "ℹ️",
            });
      }
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicle_no.trim()) {
      newErrors.vehicle_no = "Vehicle number is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors", { icon: "⚠️" });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        supplier_id: supplierId,
        vehicle_no: formData.vehicle_no.trim(),
        category: formData.category,
      };

      let response;
      if (hasVehicle) {
        // Update existing
        response = await api.put(`/suppliertype/${supplierId}`, payload);
      } else {
        // Create new
        response = await api.post("/suppliertype", payload);
      }

      console.log("✅ Vehicle saved:", response.data);
      toast.success("✅ Vehicle details saved successfully!", { icon: "🚗" });
      
      setHasVehicle(true);
      setEditing(false);
      fetchVehicleDetails();
    } catch (error: any) {
      console.error("❌ Save error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save vehicle details",
        { icon: "❌" }
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Vehicle Details" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Vehicle Details" />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Critical Alert Banner */}
          {!hasVehicle && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 ring-1 ring-red-500/20"
            >
              <Bell className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-bounce" />
              <div className="text-sm">
                <p className="text-red-300 font-bold mb-1">
                  ⚠️ Vehicle Details Required
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Please add your vehicle information to start accepting bookings from customers. This helps build trust and improves your visibility.
                </p>
              </div>
            </motion.div>
          )}

          {/* Success Banner */}
          {hasVehicle && !editing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-300 font-semibold mb-1">
                  ✅ Vehicle Details Complete
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Your vehicle information is all set. You can now accept bookings!
                </p>
              </div>
            </motion.div>
          )}

          {/* Vehicle Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Vehicle Information
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Manage your vehicle details
                  </p>
                </div>
              </div>

              {hasVehicle && !editing && (
                <motion.button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </motion.button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Vehicle Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Vehicle Number
                </label>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={formData.vehicle_no}
                    onChange={(e) => {
                      setFormData({ ...formData, vehicle_no: e.target.value });
                      setErrors({ ...errors, vehicle_no: "" });
                    }}
                    disabled={!editing}
                    placeholder={hasVehicle ? "e.g. ABC-1234" : "e.g. ABC-1234"}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800 border ${
                      errors.vehicle_no
                        ? "border-red-500/50"
                        : "border-slate-700 focus:border-cyan-500"
                    } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.vehicle_no && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.vehicle_no}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Vehicle Category
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      setErrors({ ...errors, category: "" });
                    }}
                    disabled={!editing}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800 border ${
                      errors.category
                        ? "border-red-500/50"
                        : "border-slate-700 focus:border-cyan-500"
                    } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {hasVehicle && formData.category ? formData.category : "Select category"}
                    </option>
                    <option value="Tanker">Tanker</option>
                    <option value="Drinking Water">Drinking Water</option>
                  </select>
                </div>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              {editing && (
                <div className="flex gap-3 pt-4">
                  {hasVehicle && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        fetchVehicleDetails();
                      }}
                      className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  )}

                  <motion.button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!saving ? { scale: 1.02 } : {}}
                    whileTap={!saving ? { scale: 0.98 } : {}}
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Details
                      </div>
                    )}
                  </motion.button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}