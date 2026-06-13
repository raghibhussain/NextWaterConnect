"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  role: "CONSUMER" | "SUPPLIER";
  onSuccess?: () => void;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  user,
  role,
  onSuccess,
}: ProfileEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.consumer?.address || "",
    service_area: user?.supplier?.service_area || "",
    company_name: user?.supplier?.company_name || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (role === "CONSUMER" && !formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (role === "SUPPLIER" && !formData.service_area.trim()) {
      newErrors.service_area = "Service area is required";
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
      const payload: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };

      if (role === "CONSUMER") {
        payload.consumer = {
          full_name: formData.name.trim(),
          address: formData.address.trim(),
        };
      } else if (role === "SUPPLIER") {
        payload.supplier = {
          company_name: formData.company_name.trim() || formData.name.trim(),
          service_area: formData.service_area.trim(),
        };
      }

      const response = await api.put(`/profile/${user.id}`, payload);

      console.log("✅ Profile updated:", response.data);

      // Update localStorage
      const updatedUser = response.data.profile;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("✅ Profile updated successfully!", { icon: "🎉" });
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("❌ Update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile",
        { icon: "❌" }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full max-h-screen overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {role === "CONSUMER" ? "Full Name" : "Company Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                    errors.name
                      ? "border-red-500/50"
                      : "border-slate-700 focus:border-cyan-500"
                  } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                    errors.phone
                      ? "border-red-500/50"
                      : "border-slate-700 focus:border-cyan-500"
                  } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Consumer Address */}
              {role === "CONSUMER" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      setErrors({ ...errors, address: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                      errors.address
                        ? "border-red-500/50"
                        : "border-slate-700 focus:border-cyan-500"
                    } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none h-20`}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.address}
                    </p>
                  )}
                </div>
              )}

              {/* Supplier Service Area */}
              {role === "SUPPLIER" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Service Area
                  </label>
                  <input
                    type="text"
                    value={formData.service_area}
                    onChange={(e) => {
                      setFormData({ ...formData, service_area: e.target.value });
                      setErrors({ ...errors, service_area: "" });
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800 border ${
                      errors.service_area
                        ? "border-red-500/50"
                        : "border-slate-700 focus:border-cyan-500"
                    } text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                  />
                  {errors.service_area && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.service_area}
                    </p>
                  )}
                </div>
              )}

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
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save
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