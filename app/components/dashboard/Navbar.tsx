"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, User, LogOut, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");
    if (userData) setUser(JSON.parse(userData));
    if (userRole) setRole(userRole);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query", { icon: "🔍" });
      return;
    }
    if (role === "CONSUMER") router.push(`/consumer/search?area=${encodeURIComponent(searchQuery)}`);
    else if (role === "SUPPLIER") router.push(`/supplier/bookings?search=${encodeURIComponent(searchQuery)}`);
    else if (role === "ADMIN") router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    toast.success("Logged out successfully", { icon: "👋" });
    router.push("/login");
  };

  const getProfileLink = () => {
    switch (role) {
      case "CONSUMER": return "/consumer/profile";
      case "SUPPLIER": return "/supplier/profile";
      case "ADMIN":    return "/admin/dashboard";
      default:         return "/login";
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-2 z-30"
      >
        <div className="px-4 pl-18 lg:pl-8 h-16 flex items-center gap-3">

          {/* ── Left: Title + subtitle ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
              {title}
            </h1>
            {/* Subtitle hidden on mobile to save space */}
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 truncate">
              Welcome back, {user?.name || "User"}!
            </p>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Search button */}
            <motion.button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Profile button */}
            <div className="relative" ref={menuRef}>
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 sm:pr-4 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex-shrink-0">
                  {initial}
                </div>

                {/* Name + role — visible on sm+ */}
                <div className="hidden sm:block text-left">
                  <p className="text-white font-semibold text-sm leading-tight truncate max-w-[120px]">
                    {user?.name || "User"}
                  </p>
                  <p className="text-slate-400 text-xs truncate">{role || "User"}</p>
                </div>
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl shadow-black/40 overflow-hidden z-50"
                  >
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20 flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {user?.role || role}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {user?.email || role}
                        </p>
                      </div>
                    </div>

                    {/* Edit Profile */}
                    <Link href={getProfileLink()} onClick={() => setShowUserMenu(false)}>
                      <motion.div
                        className="px-4 py-3 flex items-center gap-3 hover:bg-slate-800/60 transition-colors cursor-pointer"
                        whileHover={{ x: 3 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-white text-sm font-medium">Edit Profile</span>
                      </motion.div>
                    </Link>

                    {/* Divider */}
                    <div className="mx-4 border-t border-slate-800" />

                    {/* Logout */}
                    <motion.button
                      onClick={() => { setShowUserMenu(false); handleLogout(); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-red-400 text-sm font-medium">Logout</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Full-screen search overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    role === "CONSUMER" ? "Search by area..."
                    : role === "SUPPLIER" ? "Search bookings..."
                    : "Search users..."
                  }
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-900 border border-slate-600 focus:border-cyan-500 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-base transition-all shadow-2xl"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
              <p className="text-slate-500 text-xs text-center mt-3">
                Press Enter to search · Esc or tap outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}