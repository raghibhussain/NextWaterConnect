"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable({
  columns,
  data,
  loading = false,
  pagination,
}: DataTableProps) {
  if (loading) {
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

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/30 rounded-xl border border-slate-700">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`${col.width || "col-span-2"} text-sm font-semibold text-slate-300`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {data.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="hidden md:grid grid-cols-12 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all items-center"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={`${col.width || "col-span-2"} text-sm text-slate-300 truncate`}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </div>
            ))}
          </motion.div>
        ))}

        {/* Mobile Cards */}
        {data.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="md:hidden p-4 rounded-xl bg-slate-900 border border-slate-800"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between mb-2 last:mb-0">
                <span className="text-xs text-slate-400 font-semibold">
                  {col.label}
                </span>
                <span className="text-sm text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800"
        >
          <span className="text-sm text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() =>
                pagination.onPageChange(Math.max(1, pagination.page - 1))
              }
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
              ) {
                return (
                  <motion.button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      pagination.page === pageNum
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pageNum}
                  </motion.button>
                );
              } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                return (
                  <span key={pageNum} className="text-slate-400">
                    ...
                  </span>
                );
              }
            })}

            <motion.button
              onClick={() =>
                pagination.onPageChange(
                  Math.min(pagination.totalPages, pagination.page + 1)
                )
              }
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}