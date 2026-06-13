"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group overflow-hidden"
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Background Gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Top Line */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>

          {trend && (
            <span
              className={`text-sm font-semibold ${
                trend.isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>

        {/* Value */}
        <motion.h3
          className="text-3xl font-black text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {value}
        </motion.h3>

        {/* Title */}
        <p className="text-slate-400 text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
}