"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Droplets, Star, Shield, Clock,
  ChevronRight, MapPin, Phone,
  CheckCircle, ArrowRight, Users,
  TrendingUp, Award, Menu, X,
  Zap, Globe, Heart, ChevronDown
} from "lucide-react";

// ============ ANIMATION VARIANTS ============
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 60 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const slideUp: Variants = {
  hidden:  { opacity: 0, y: 100 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ============ ANIMATED COUNTER ============
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount]   = useState(0);
  const ref                 = useRef(null);
  const isInView            = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start     = 0;
    const end     = value;
    const duration = 2000;
    const step    = end / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

// ============ PARTICLES ============
const particles = [
  { left: "5%",  top: "15%", size: 3, duration: 4,   delay: 0    },
  { left: "15%", top: "70%", size: 2, duration: 5,   delay: 0.5  },
  { left: "25%", top: "35%", size: 4, duration: 6,   delay: 1    },
  { left: "35%", top: "80%", size: 2, duration: 4.5, delay: 1.5  },
  { left: "45%", top: "20%", size: 3, duration: 5.5, delay: 0.2  },
  { left: "55%", top: "60%", size: 2, duration: 4,   delay: 0.8  },
  { left: "65%", top: "40%", size: 4, duration: 6,   delay: 1.2  },
  { left: "75%", top: "85%", size: 2, duration: 5,   delay: 0.4  },
  { left: "85%", top: "25%", size: 3, duration: 4.5, delay: 1.8  },
  { left: "92%", top: "65%", size: 2, duration: 5.5, delay: 0.6  },
  { left: "10%", top: "50%", size: 3, duration: 4,   delay: 1.4  },
  { left: "30%", top: "10%", size: 2, duration: 6,   delay: 0.3  },
  { left: "50%", top: "90%", size: 4, duration: 5,   delay: 1.6  },
  { left: "70%", top: "15%", size: 2, duration: 4.5, delay: 0.9  },
  { left: "88%", top: "45%", size: 3, duration: 5.5, delay: 1.1  },
];

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            left:   p.left,
            top:    p.top,
            width:  p.size,
            height: p.size,
          }}
          animate={{
            y:       [0, -40, 0],
            opacity: [0.1, 0.6, 0.1],
            scale:   [1, 1.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat:   Infinity,
            delay:    p.delay,
            ease:     "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs */}
      {[
        { left: "20%", top: "30%", color: "bg-cyan-400/10",   size: 200 },
        { left: "70%", top: "60%", color: "bg-blue-400/10",   size: 300 },
        { left: "50%", top: "80%", color: "bg-indigo-400/10", size: 150 },
      ].map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full ${orb.color} blur-3xl`}
          style={{
            left:   orb.left,
            top:    orb.top,
            width:  orb.size,
            height: orb.size,
          }}
          animate={{
            scale:   [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============ ANIMATED WAVE ============
function AnimatedWave() {
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
      <motion.svg
        viewBox="0 0 1440 120"
        fill="none"
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.path
          d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
          fill="rgba(15, 23, 42, 0.8)"
          animate={{
            d: [
              "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
              "M0,40 C240,0 480,120 720,40 C960,0 1200,120 1440,40 L1440,120 L0,120 Z",
              "M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z",
            ],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z"
          fill="rgb(2, 6, 23)"
          animate={{
            d: [
              "M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z",
              "M0,60 C360,100 720,20 1080,60 C1260,80 1380,50 1440,60 L1440,120 L0,120 Z",
              "M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </motion.svg>
    </div>
  );
}

// ============ NAVBAR ============
function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    setActiveLink(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const navLinks = [
    { label: "Features",     id: "features"     },
    { label: "How It Works", id: "how-it-works"  },
    { label: "Testimonials", id: "testimonials"  },
    { label: "Contact",      id: "contact"       },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0,    opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Droplets className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <span className="text-white font-black text-xl tracking-tight">
                Water<span className="text-cyan-400">Connect</span>
              </span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-white/10">
            {navLinks.map((link) => (
              <motion.button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeLink === link.id
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeLink === link.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <motion.button
                className="text-gray-300 hover:text-white border border-white/10 hover:border-white/30 text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10">Get Started</span>
              </motion.button>
            </Link>
          </div>

          <motion.button
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate: 90,   opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{   rotate: -90,  opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="md:hidden bg-slate-950/98 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => scrollToSection(link.id)}
                    className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                  >
                    {link.label}
                  </motion.button>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                  <Link href="/login">
                    <button className="w-full text-gray-300 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-all">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-cyan-500/25">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  const { scrollY }   = useScroll();
  const y             = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity       = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #020617 0%, #0c1a2e 30%, #0369a1 70%, #0ea5e9 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <Particles />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-full px-5 py-2.5 mb-8"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald-400"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-cyan-300 text-sm font-semibold tracking-wide">
            Pakistan&apos;s #1 Water Supply Platform
          </span>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </motion.div>
        </motion.div>

        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight"
          >
            Clean Water,
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
          >
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
                Delivered
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full"
                style={{
                  background: "linear-gradient(to right, #67e8f9, #93c5fd, #a5b4fc)",
                }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-blue-200 leading-tight"
          >
            Right to Your Door
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Connect with trusted water suppliers in your area.
          Book, pay, and rate — all in one place.
          <span className="text-cyan-400 font-semibold"> Fast, reliable, and affordable.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/register">
            <motion.button
              className="group relative overflow-hidden flex items-center gap-3 bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl shadow-white/10"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                Get Started Free
              </span>
              <motion.div
                className="relative z-10 group-hover:text-white transition-colors duration-300"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </Link>

          <motion.button
            onClick={() => {
              const el = document.getElementById("features");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="group flex items-center gap-3 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            Watch Demo
            <motion.div
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
        >
          {[
            { value: 500,  suffix: "+",  label: "Suppliers",  icon: <Users className="w-5 h-5" />    },
            { value: 10000, suffix: "+", label: "Deliveries", icon: <Zap className="w-5 h-5" />      },
            { value: 49,   suffix: "★",  label: "Rating",     icon: <Star className="w-5 h-5" />     },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="relative group text-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="flex justify-center mb-1 text-cyan-400">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-slate-400 text-xs mt-1 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => {
          const el = document.getElementById("features");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="text-slate-400 text-xs font-medium tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
        >
          <motion.div
            className="w-1 h-2 rounded-full bg-cyan-400"
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>

      <AnimatedWave />
    </section>
  );
}

// ============ FEATURES SECTION ============
function FeaturesSection() {
  const features = [
    {
      icon:        <Droplets className="w-7 h-7" />,
      title:       "Pure Water Supply",
      description: "Get access to certified clean water suppliers in your area with quality guarantee.",
      gradient:    "from-blue-500 to-cyan-500",
      glow:        "shadow-blue-500/20",
      border:      "hover:border-blue-500/30",
    },
    {
      icon:        <Clock className="w-7 h-7" />,
      title:       "Fast Delivery",
      description: "Schedule water delivery at your convenience. Same-day delivery available.",
      gradient:    "from-violet-500 to-purple-600",
      glow:        "shadow-violet-500/20",
      border:      "hover:border-violet-500/30",
    },
    {
      icon:        <Shield className="w-7 h-7" />,
      title:       "Secure Payments",
      description: "Pay safely with multiple payment options. Cash, card, or online transfer.",
      gradient:    "from-emerald-500 to-teal-500",
      glow:        "shadow-emerald-500/20",
      border:      "hover:border-emerald-500/30",
    },
    {
      icon:        <Star className="w-7 h-7" />,
      title:       "Verified Suppliers",
      description: "All suppliers are verified and rated by real customers for your safety.",
      gradient:    "from-amber-500 to-orange-500",
      glow:        "shadow-amber-500/20",
      border:      "hover:border-amber-500/30",
    },
    {
      icon:        <MapPin className="w-7 h-7" />,
      title:       "Area Based Search",
      description: "Find water suppliers near you with our smart location-based search system.",
      gradient:    "from-rose-500 to-pink-600",
      glow:        "shadow-rose-500/20",
      border:      "hover:border-rose-500/30",
    },
    {
      icon:        <Globe className="w-7 h-7" />,
      title:       "24/7 Support",
      description: "Our support team is always ready to help you with any issues or queries.",
      gradient:    "from-indigo-500 to-blue-600",
      glow:        "shadow-indigo-500/20",
      border:      "hover:border-indigo-500/30",
    },
  ];

  return (
    <section id="features" className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full px-4 py-2 mb-6 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              Why Choose WaterConnect
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
          >
            Everything You{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Need
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed"
          >
            A complete water supply management platform
            built for consumers and suppliers across Pakistan.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className={`group relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 ${feature.border} transition-all duration-500 cursor-pointer overflow-hidden`}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.05 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${feature.gradient}`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              />

              <motion.div
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg ${feature.glow}`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                {feature.description}
              </p>

              <motion.div
                className="flex items-center gap-2 mt-6 text-sm font-semibold text-slate-500 group-hover:text-cyan-400 transition-colors duration-300"
                initial={{ x: -10, opacity: 0 }}
                whileHover={{ x: 0,   opacity: 1 }}
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ HOW IT WORKS ============
function HowItWorksSection() {
  const steps = [
    {
      step:        "01",
      title:       "Create Account",
      description: "Sign up as a consumer or supplier in just 2 minutes. No paperwork needed.",
      icon:        <Users className="w-8 h-8" />,
      color:       "from-cyan-500 to-blue-600",
      glow:        "shadow-cyan-500/25",
    },
    {
      step:        "02",
      title:       "Find & Book",
      description: "Search suppliers in your area, check ratings, and book water delivery instantly.",
      icon:        <MapPin className="w-8 h-8" />,
      color:       "from-violet-500 to-purple-600",
      glow:        "shadow-violet-500/25",
    },
    {
      step:        "03",
      title:       "Pay & Rate",
      description: "Pay securely after delivery and rate your experience to help the community.",
      icon:        <Heart className="w-8 h-8" />,
      color:       "from-rose-500 to-pink-600",
      glow:        "shadow-rose-500/25",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full px-4 py-2 mb-6 text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              Works
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-slate-400 text-xl max-w-xl mx-auto"
          >
            Get started in just 3 simple steps
          </motion.p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={slideUp}
                className="relative group"
              >
                <motion.div
                  className={`relative p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-500 transition-all duration-500 text-center overflow-hidden`}
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
                  />

                  <motion.div
                    className="text-8xl font-black text-slate-800 absolute top-2 right-4 select-none leading-none"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    {step.step}
                  </motion.div>

                  <motion.div
                    className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mx-auto mb-6 shadow-2xl ${step.glow}`}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}

                    <motion.div
                      className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color}`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    />
                  </motion.div>

                  <h3 className="text-2xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>

                  <motion.div
                    className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r ${step.color} rounded-full`}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ TESTIMONIALS ============
function TestimonialsSection() {
  const testimonials = [
    {
      name:    "Ahmed Hassan",
      role:    "Home Owner, Karachi",
      comment: "WaterConnect saved us during the water shortage. Reliable suppliers and incredibly fast delivery!",
      stars:   5,
      avatar:  "AH",
      color:   "from-blue-500 to-cyan-500",
    },
    {
      name:    "Sara Khan",
      role:    "Business Owner, Lahore",
      comment: "Best platform for water supply. Easy booking and secure payments. I highly recommend it!",
      stars:   5,
      avatar:  "SK",
      color:   "from-violet-500 to-purple-500",
    },
    {
      name:    "Muhammad Ali",
      role:    "Water Supplier",
      comment: "As a supplier, this platform helped me reach so many more customers and grow my business.",
      stars:   5,
      avatar:  "MA",
      color:   "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section id="testimonials" className="py-32 bg-slate-950 relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-amber-500/30"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        transition={{ duration: 0.8 }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-4 py-2 mb-6 text-sm font-semibold">
              <Star className="w-4 h-4 fill-amber-400" />
              Customer Reviews
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-black text-white mb-6"
          >
            What People{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Say
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all duration-500 overflow-hidden"
              whileHover={{ y: -8 }}
            >
              <div className="absolute top-6 right-8 text-7xl text-slate-800 font-black leading-none select-none">
                &ldquo;
              </div>

              <div className="flex gap-1 mb-6">
                {[...Array(t.stars)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: j * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed mb-8 text-base relative z-10">
                &ldquo;{t.comment}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <motion.div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {t.avatar}
                </motion.div>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-slate-400 text-sm">{t.role}</div>
                </div>
              </div>

              <motion.div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${t.color}`}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
function CTASection() {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #020617 0%, #0c1a2e 40%, #0369a1 80%, #0ea5e9 100%)",
          backgroundSize: "400% 400%",
          animation: "gradient 8s ease infinite",
        }}
      />

      <Particles />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.div
            variants={scaleIn}
            className="relative w-28 h-28 mx-auto mb-10"
          >
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl shadow-cyan-500/30 flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.05 }}
            >
              <Droplets className="w-14 h-14 text-white" />
            </motion.div>
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-3xl border-2 border-cyan-400/30"
                animate={{
                  scale:   [1, 1 + ring * 0.3],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat:   Infinity,
                  delay:    ring * 0.4,
                }}
              />
            ))}
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
          >
            Ready to Get{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
              Started?
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of satisfied customers.
            Register today and get your first water
            delivery booked in minutes!
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <motion.button
                className="group relative overflow-hidden flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Register as Consumer</span>
                <ArrowRight className="relative z-10 w-5 h-5 group-hover:text-white transition-colors duration-300" />
              </motion.button>
            </Link>

            <Link href="/register">
              <motion.button
                className="flex items-center justify-center gap-2 border-2 border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 font-semibold px-10 py-4 rounded-2xl text-lg transition-all duration-300 backdrop-blur-sm"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                Join as Supplier
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { icon: <Shield className="w-4 h-4" />,      text: "Secure Platform"    },
              { icon: <CheckCircle className="w-4 h-4" />, text: "Verified Suppliers" },
              { icon: <TrendingUp className="w-4 h-4" />,  text: "Best Prices"        },
              { icon: <Award className="w-4 h-4" />,       text: "Top Rated"          },
            ].map((badge, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 text-slate-400 text-sm"
                whileHover={{ scale: 1.1, color: "#22d3ee" }}
              >
                <span className="text-cyan-400">{badge.icon}</span>
                {badge.text}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <motion.div
            className="md:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeLeft}
          >
            <motion.div
              className="flex items-center gap-3 mb-6 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Droplets className="w-7 h-7 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight">
                Water<span className="text-cyan-400">Connect</span>
              </span>
            </motion.div>

            <p className="text-slate-400 leading-relaxed max-w-sm mb-6">
              Pakistan&apos;s most trusted water supply booking platform.
              Connecting consumers with verified water suppliers nationwide.
            </p>

            <div className="flex gap-3">
              {["FB", "TW", "IG", "LI"].map((social, i) => (
                <motion.div
                  key={social}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-all duration-300 border border-slate-700 hover:border-transparent"
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {social}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h4 className="font-bold mb-6 text-white text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="space-y-3">
              {[
                { label: "Features",     id: "features"    },
                { label: "How It Works", id: "how-it-works" },
                { label: "Testimonials", id: "testimonials" },
                { label: "Login",        href: "/login"     },
                { label: "Register",     href: "/register"  },
              ].map((link) => (
                <div key={link.label}>
                  {link.href ? (
                    <Link href={link.href}>
                      <motion.span
                        className="text-slate-400 hover:text-cyan-400 transition-colors text-sm cursor-pointer flex items-center gap-2 group"
                        whileHover={{ x: 4 }}
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </motion.span>
                    </Link>
                  ) : (
                    <motion.button
                      onClick={() => scrollToSection(link.id!)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-sm text-left flex items-center gap-2 group"
                      whileHover={{ x: 4 }}
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeRight}
          >
            <h4 className="font-bold mb-6 text-white text-sm uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-4">
              {[
                { icon: "📧", text: "support@waterconnect.pk" },
                { icon: "📞", text: "0300-1234567"            },
                { icon: "📍", text: "Karachi, Pakistan"       },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-slate-400 text-sm hover:text-slate-300 transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-slate-500 text-sm">
            © 2025 WaterConnect. All rights reserved.
          </p>
          <motion.p
            className="text-slate-500 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Made with 💧 in Pakistan
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}

// ============ MAIN PAGE WITH HYDRATION FIX ============
export default function LandingPage() {
    const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-slate-950" />;
  }
  return (
    <main className="overflow-x-hidden bg-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}