"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/dashboard/Navbar";
import ProfileEditModal from "@/app/components/ProfileEditModal";
import { User, Mail, Phone, MapPin, Edit, Loader2 } from "lucide-react";

export default function ConsumerProfile() {
  const [user, setUser] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar title="My Profile" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title="My Profile" />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-cyan-500/25">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                <Phone className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{user?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                <MapPin className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-slate-400 text-sm">Address</p>
                  <p className="text-white font-semibold">
                    {user?.consumer?.address || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={() => setEditModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={user}
        role="CONSUMER"
        onSuccess={() => {
          const userData = localStorage.getItem("user");
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }}
      />
    </div>
  );
}