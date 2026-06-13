"use client";

import { motion } from "framer-motion";

export function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="w-12 h-4 rounded bg-slate-800" />
      </div>
      <div className="w-20 h-8 rounded bg-slate-800 mb-2" />
      <div className="w-32 h-4 rounded bg-slate-800" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-4 rounded bg-slate-800" />
              <div className="w-1/2 h-3 rounded bg-slate-800" />
            </div>
            <div className="w-20 h-8 rounded-lg bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}