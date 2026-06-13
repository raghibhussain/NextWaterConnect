"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userRole = localStorage.getItem("role");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (userRole) {
      setRole(userRole);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query", { icon: "🔍" });
      return;
    }

    // Route based on role
    if (role === "CONSUMER") {
      router.push(`/consumer/search?area=${encodeURIComponent(searchQuery)}`);
    } else if (role === "SUPPLIER") {
      router.push(`/supplier/bookings?search=${encodeURIComponent(searchQuery)}`);
    } else if (role === "ADMIN") {
      router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }

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
      case "CONSUMER":
        return "/consumer/profile";
      case "SUPPLIER":
        return "/supplier/profile";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-white">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {user?.name || "User"}!
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <motion.div className="relative">
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-form"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  onSubmit={handleSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    placeholder={
                      role === "CONSUMER"
                        ? "Search area..."
                        : role === "SUPPLIER"
                        ? "Search bookings..."
                        : "Search users..."
                    }
                    className="px-4 py-2 rounded-lg bg-slate-800 border border-cyan-500 text-white placeholder-slate-500 focus:outline-none text-sm w-40"
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                  />
                </motion.form>
              ) : (
                <motion.button
                  key="search-button"
                  onClick={() => setSearchOpen(true)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Profile Menu */}
          <motion.div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 pr-4 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/25">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block">
                <p className="text-white font-semibold text-sm">
                  {user?.name || "User"}
                </p>
                <p className="text-slate-400 text-xs">{role || "User"}</p>
              </div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden z-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  {/* Profile Link */}
                  <Link href={getProfileLink()}>
                    <motion.div
                      className="px-4 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-800"
                      whileHover={{ x: 4 }}
                    >
                      <User className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">
                        Edit Profile
                      </span>
                    </motion.div>
                  </Link>

                  {/* Logout */}
                  <motion.button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-left text-red-400 hover:text-red-300"
                    whileHover={{ x: 4 }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}