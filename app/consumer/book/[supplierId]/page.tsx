"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  Calendar, Package, DollarSign, MapPin, Truck,
  Phone, Star, ArrowLeft, CheckCircle, Loader2,
  AlertCircle, Info
} from "lucide-react";
import Navbar from "@/app/components/dashboard/Navbar";
import Link from "next/link";

interface Supplier {
  id: number;
  company_name: string;
  service_area: string;
  user: {
    phone: string;
    email: string;
  };
  supplier_type?: {
    category: string;
    vehicle_no: string;
  };
}

export default function BookSupplier() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params.supplierId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [consumer, setConsumer] = useState<any>(null);

  const [formData, setFormData] = useState({
    booking_date: "",
    quantity: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch supplier details
  useEffect(() => {
    fetchSupplierDetails();
    loadConsumerData();
  }, [supplierId]);

  const loadConsumerData = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setConsumer(JSON.parse(userData));
    }
  };

  const fetchSupplierDetails = async () => {
    try {
      const response = await api.get(`/suppliertype/${supplierId}`);
      console.log("📦 Supplier details:", response.data);
      
      setSupplier(response.data.supplier_type.supplier);
      setLoading(false);
    } catch (error: any) {
      console.error("❌ Error fetching supplier:", error);
      toast.error("Failed to load supplier details", { icon: "❌" });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.booking_date) {
      newErrors.booking_date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.booking_date = "Date cannot be in the past";
      }
    }

    if (!formData.quantity) {
      newErrors.quantity = "Please enter quantity";
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
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

    if (!consumer?.id) {
      toast.error("Consumer ID not found. Please login again.", { icon: "❌" });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        booking_date: formData.booking_date,
        quantity: parseInt(formData.quantity),
      };

      console.log("📤 Creating booking:", payload);

      const response = await api.post(
        `/booking?consumerId=${consumer.id}&supplierId=${supplierId}`,
        payload
      );

      console.log("✅ Booking created:", response.data);

      toast.success("🎉 Booking created successfully!", {
        duration: 3000,
      });

      setTimeout(() => {
        router.push("/consumer/bookings");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Booking error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create booking",
        { icon: "❌" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Book Supplier" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="Book Supplier" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Supplier Not Found
            </h2>
            <Link href="/consumer/search">
              <button className="mt-4 px-6 py-3 rounded-xl bg-cyan-500 text-white font-semibold">
                Back to Search
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="Book Water Delivery" />

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Link href="/consumer/search">
            <motion.button
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </motion.button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 h-fit"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Supplier Details
              </h2>

              {/* Company Logo */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/25">
                  {supplier.company_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {supplier.company_name}
                  </h3>
                  <p className="text-slate-400 text-sm">Water Supplier</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Service Area */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Service Area</p>
                    <p className="text-white font-semibold">
                      {supplier.service_area}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Contact</p>
                    <p className="text-white font-semibold">
                      {supplier.user.phone}
                    </p>
                  </div>
                </div>

                {/* Vehicle Type */}
                {supplier.supplier_type && (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                      <Truck className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Vehicle Type</p>
                        <p className="text-white font-semibold">
                          {supplier.supplier_type.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                      <Package className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-slate-400 text-sm">Vehicle Number</p>
                        <p className="text-white font-semibold">
                          {supplier.supplier_type.vehicle_no}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Book Delivery
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="date"
                      value={formData.booking_date}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          booking_date: e.target.value,
                        });
                        setErrors({ ...errors, booking_date: "" });
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800 border ${
                        errors.booking_date
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                    />
                  </div>
                  {errors.booking_date && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.booking_date}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Quantity (Units)
                  </label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => {
                        setFormData({ ...formData, quantity: e.target.value });
                        setErrors({ ...errors, quantity: "" });
                      }}
                      min="1"
                      placeholder="Enter quantity"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800 border ${
                        errors.quantity
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                    />
                  </div>
                  {errors.quantity && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.quantity}
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-semibold mb-1">
                      Booking Process
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Your booking will be sent to the supplier for approval.
                      Once accepted, you can proceed with payment.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!submitting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Booking...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </div>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}