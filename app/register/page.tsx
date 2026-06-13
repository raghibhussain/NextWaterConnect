"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Droplets, Mail, Lock, Eye, EyeOff, User, Phone,
  MapPin, Truck, ArrowRight, AlertCircle, Sparkles,
  Loader2, CheckCircle, Shield, Users, Store
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

// ============ ANIMATION VARIANTS ============
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

// ============ PARTICLES ============
function Particles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </div>
  );
}

// ============ RIPPLE BACKGROUND ============
function RippleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10"
          style={{
            width: `${ring * 300}px`,
            height: `${ring * 300}px`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: ring * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ============ MAIN REGISTER PAGE ============
export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CONSUMER" | "SUPPLIER">("CONSUMER");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    area: "",
    // Supplier specific
    vehicleNo: "",
    category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{11}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone must be 11 digits (e.g., 03001234567)";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        icon: "⚠️",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = `/api/auth/register/${role.toLowerCase()}`;

      // ✅ Build payload matching backend expectations
      const payload =
        role === "CONSUMER"
          ? {
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              phone: formData.phone.trim(),
              full_name: formData.name.trim(),
              address: formData.area.trim(),
            }
          : {
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              phone: formData.phone.trim(),
              company_name: formData.name.trim(),
              service_area: formData.area.trim(),
            };

      console.log("📤 Registering user:", endpoint);
      console.log("📦 Payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(endpoint, payload);

      console.log("✅ User registered:", response.data);

      // ✅ If SUPPLIER and has vehicle details, create supplier_type
      if (role === "SUPPLIER" && (formData.category || formData.vehicleNo)) {
        const supplierId = response.data.user.id;

        if (!formData.category || !formData.vehicleNo) {
          toast.error("Both vehicle category and number are required", {
            icon: "⚠️",
          });
          setLoading(false);
          return;
        }

        console.log("🚛 Creating supplier type for supplier ID:", supplierId);

        try {
          const supplierTypePayload = {
            supplier_id: supplierId,
            vehicle_no: formData.vehicleNo.trim(),
            category: formData.category,
          };

          console.log("📦 Supplier Type Payload:", supplierTypePayload);

          const supplierTypeResponse = await axios.post(
            "/api/suppliertype",
            supplierTypePayload
          );

          console.log("✅ Supplier type created:", supplierTypeResponse.data);
        } catch (supplierTypeError: any) {
          console.error("❌ Supplier type creation failed:", supplierTypeError);
          toast.error(
            supplierTypeError.response?.data?.message ||
              "Failed to add vehicle details. You can add them later from your profile.",
            { icon: "⚠️", duration: 5000 }
          );
        }
      }

      toast.success("🎉 Account created successfully!", {
        duration: 3000,
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        area: "",
        vehicleNo: "",
        category: "",
      });

      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      toast.error(errorMessage, {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #020617 0%, #0c1a2e 30%, #0369a1 70%, #0ea5e9 100%)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}
    >
      <Particles />
      <RippleBackground />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo */}
        <motion.div variants={scaleIn} className="text-center mb-8">
          <Link href="/">
            <motion.div
              className="inline-flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Droplets className="w-8 h-8 text-white" />
              </motion.div>
              <span className="text-white font-black text-2xl tracking-tight">
                Water<span className="text-cyan-400">Connect</span>
              </span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={fadeUp}
          className="relative p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              variants={scaleIn}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-4"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-semibold">
                Create Your Account
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-3xl font-black text-white mb-2"
            >
              Join WaterConnect
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-400">
              Choose your role and get started
            </motion.p>
          </div>

          {/* Role Tabs */}
          <motion.div variants={fadeUp} className="mb-8">
            <div className="flex gap-2 p-1.5 bg-slate-800/50 rounded-2xl border border-slate-700">
              {(["CONSUMER", "SUPPLIER"] as const).map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    if (r === "CONSUMER") {
                      const { vehicleNo, category, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                  className={`relative flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    role === r
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  whileHover={{ scale: role === r ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {role === r && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/25"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {r === "CONSUMER" ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                    {r}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={stagger}
                className="space-y-5"
              >
                {/* Name */}
                <motion.div variants={slideIn}>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    {role === "CONSUMER" ? "Full Name" : "Company Name"}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setErrors({ ...errors, name: "" });
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border ${
                        errors.name
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                      placeholder={
                        role === "CONSUMER"
                          ? "Enter your full name"
                          : "Enter company name"
                      }
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={slideIn}>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setErrors({ ...errors, email: "" });
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border ${
                        errors.email
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Phone & Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={slideIn}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setErrors({ ...errors, phone: "" });
                        }}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border ${
                          errors.phone
                            ? "border-red-500/50"
                            : "border-slate-700 focus:border-cyan-500"
                        } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                        placeholder="03001234567"
                      />
                    </div>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={slideIn}>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      {role === "CONSUMER" ? "Address" : "Service Area"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => {
                          setFormData({ ...formData, area: e.target.value });
                          setErrors({ ...errors, area: "" });
                        }}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border ${
                          errors.area
                            ? "border-red-500/50"
                            : "border-slate-700 focus:border-cyan-500"
                        } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                        placeholder="e.g. Gulshan, Karachi"
                      />
                    </div>
                    {errors.area && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-red-400 text-sm mt-2 flex items-center gap-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.area}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                {/* Supplier Vehicle Details */}
                {role === "SUPPLIER" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-slate-700 space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                    >
                      <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-300 font-semibold mb-1">
                          Vehicle Details (Optional)
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          Add your vehicle information now or complete it later from your dashboard.
                        </p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div variants={slideIn}>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Vehicle Category{" "}
                          <span className="text-slate-500 font-normal text-xs">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                            <Truck className="w-5 h-5" />
                          </div>
                          <select
                            value={formData.category}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                category: e.target.value,
                              });
                            }}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          >
                            <option value="">Select category</option>
                            <option value="Tanker">Tanker</option>
                            <option value="Drinking Water">Drinking Water</option>
                          </select>
                        </div>
                      </motion.div>

                      <motion.div variants={slideIn}>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Vehicle Number{" "}
                          <span className="text-slate-500 font-normal text-xs">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                            <Truck className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.vehicleNo}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                vehicleNo: e.target.value,
                              });
                            }}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="e.g. ABC-1234"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Password */}
                <motion.div variants={slideIn}>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setErrors({ ...errors, password: "" });
                      }}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-800/50 border ${
                        errors.password
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                      placeholder="••••••••"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={slideIn}>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        });
                        setErrors({ ...errors, confirmPassword: "" });
                      }}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-800/50 border ${
                        errors.confirmPassword
                          ? "border-red-500/50"
                          : "border-slate-700 focus:border-cyan-500"
                      } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                      placeholder="••••••••"
                    />
                    <motion.button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              variants={fadeUp}
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">
                Already have an account?
              </span>
            </div>
          </motion.div>

          {/* Login Link */}
          <motion.div variants={fadeUp} className="text-center">
            <Link href="/login">
              <motion.button
                type="button"
                className="group w-full flex items-center justify-center gap-2 border-2 border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white font-semibold py-3.5 rounded-xl transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-5 h-5 text-cyan-400" />
                Sign In Instead
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Back to Home */}
        <motion.div variants={fadeUp} className="text-center mt-6">
          <Link
            href="/"
            className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors inline-flex items-center gap-2 group"
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors"
              whileHover={{ scale: 1.1, rotate: -180 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </motion.div>
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}