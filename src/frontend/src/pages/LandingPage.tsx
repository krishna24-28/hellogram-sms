import { Link } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Bot,
  GraduationCap,
  Shield,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { HUDCircle } from "../components/ui/HUDCircle";
import { HologramBackground } from "../components/ui/HologramBackground";
import { NeonButton } from "../components/ui/NeonButton";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";

const INF = Number.POSITIVE_INFINITY;

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────
const stats = [
  {
    value: "1,247",
    label: "Total Students",
    color: "cyan" as const,
    ring: "border-primary/60",
  },
  {
    value: "89",
    label: "Faculty Members",
    color: "yellow" as const,
    ring: "border-secondary/60",
  },
  {
    value: "42",
    label: "Courses",
    color: "cyan" as const,
    ring: "border-primary/60",
  },
  {
    value: "94.7%",
    label: "Success Rate",
    color: "yellow" as const,
    ring: "border-secondary/60",
  },
];

const portals = [
  {
    icon: <GraduationCap size={28} />,
    title: "Student Portal",
    description:
      "Track grades, attendance, assignments, and outing requests in one unified holographic interface.",
    color: "cyan" as const,
    colorClass: "text-primary",
    borderClass: "border-primary/30",
    bgClass: "bg-primary/5",
    glowStyle: "0 0 24px oklch(0.7 0.22 190 / 0.4)",
    badge: "STUDENT",
  },
  {
    icon: <BookOpen size={28} />,
    title: "Teacher Hub",
    description:
      "Manage classes, mark attendance, review outing requests, and assign grades with ease.",
    color: "yellow" as const,
    colorClass: "text-secondary",
    borderClass: "border-secondary/30",
    bgClass: "bg-secondary/5",
    glowStyle: "0 0 24px oklch(0.75 0.2 95 / 0.4)",
    badge: "TEACHER",
  },
  {
    icon: <Shield size={28} />,
    title: "Admin Control",
    description:
      "Full system oversight — users, approvals, analytics, and complete configuration.",
    color: "magenta" as const,
    colorClass: "text-accent",
    borderClass: "border-accent/30",
    bgClass: "bg-accent/5",
    glowStyle: "0 0 24px oklch(0.65 0.24 305 / 0.4)",
    badge: "ADMIN",
  },
  {
    icon: <Bot size={28} />,
    title: "AI Assistant",
    description:
      "Personal study roadmaps and real-time academic support powered by AI for engineering syllabus.",
    color: "cyan" as const,
    colorClass: "text-primary",
    borderClass: "border-primary/30",
    bgClass: "bg-primary/5",
    glowStyle: "0 0 24px oklch(0.68 0.2 165 / 0.4)",
    badge: "AI",
  },
  {
    icon: <Activity size={28} />,
    title: "Live Analytics",
    description:
      "Real-time performance charts, spider graphs, quiz scores, and detailed attendance analytics.",
    color: "yellow" as const,
    colorClass: "text-secondary",
    borderClass: "border-secondary/30",
    bgClass: "bg-secondary/5",
    glowStyle: "0 0 24px oklch(0.75 0.2 95 / 0.4)",
    badge: "ANALYTICS",
  },
  {
    icon: <Users size={28} />,
    title: "Multi-Role System",
    description:
      "Seamless role-based access control for students, teachers, and administrators.",
    color: "magenta" as const,
    colorClass: "text-accent",
    borderClass: "border-accent/30",
    bgClass: "bg-accent/5",
    glowStyle: "0 0 24px oklch(0.65 0.24 305 / 0.4)",
    badge: "SYSTEM",
  },
];

// ──────────────────────────────────────────────
// Floating Particles
// ──────────────────────────────────────────────
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 8,
  duration: Math.random() * 12 + 8,
  color:
    i % 3 === 0
      ? "oklch(0.7 0.22 190 / 0.6)"
      : i % 3 === 1
        ? "oklch(0.75 0.2 95 / 0.5)"
        : "oklch(0.65 0.24 305 / 0.4)",
}));

function FloatingParticles() {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(p.id) * 20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: INF,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Scan Line Overlay
// ──────────────────────────────────────────────
function ScanLines() {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.03]"
      aria-hidden="true"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, oklch(0.7 0.22 190 / 1) 2px, oklch(0.7 0.22 190 / 1) 3px)",
        backgroundSize: "100% 3px",
      }}
    />
  );
}

// ──────────────────────────────────────────────
// Large Orbital HUD
// ──────────────────────────────────────────────
function OrbitalHUD() {
  const shouldReduce = useReducedMotion();
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 440, height: 440 }}
    >
      {/* Outermost ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 shadow-glow-cyan"
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 30, repeat: INF, ease: "linear" }}
      />
      {/* Second ring */}
      <motion.div
        className="absolute rounded-full border border-dashed border-secondary/40 shadow-glow-yellow"
        style={{ inset: 28 }}
        animate={shouldReduce ? {} : { rotate: -360 }}
        transition={{ duration: 20, repeat: INF, ease: "linear" }}
      />
      {/* Third ring */}
      <motion.div
        className="absolute rounded-full border-2 border-dashed border-primary/50"
        style={{ inset: 64 }}
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 14, repeat: INF, ease: "linear" }}
      />
      {/* Fourth ring */}
      <motion.div
        className="absolute rounded-full border border-secondary/30"
        style={{ inset: 100 }}
        animate={shouldReduce ? {} : { rotate: -360 }}
        transition={{ duration: 9, repeat: INF, ease: "linear" }}
      />
      {/* Accent ring */}
      <motion.div
        className="absolute rounded-full border border-dashed border-accent/20"
        style={{ inset: 140 }}
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 7, repeat: INF, ease: "linear" }}
      />
      {/* Orbiting dot — outer */}
      <motion.div
        className="absolute"
        style={{
          top: 0,
          left: "50%",
          marginLeft: -5,
          transformOrigin: "5px 220px",
        }}
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 30, repeat: INF, ease: "linear" }}
      >
        <div className="w-3 h-3 rounded-full bg-secondary shadow-glow-yellow" />
      </motion.div>
      {/* Orbiting dot — second ring */}
      <motion.div
        className="absolute"
        style={{
          top: 28,
          left: "50%",
          marginLeft: -4,
          transformOrigin: "4px 192px",
        }}
        animate={shouldReduce ? {} : { rotate: -360 }}
        transition={{ duration: 18, repeat: INF, ease: "linear" }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow-cyan" />
      </motion.div>
      {/* Orbiting dot — accent */}
      <motion.div
        className="absolute"
        style={{
          top: 64,
          left: "50%",
          marginLeft: -3,
          transformOrigin: "3px 156px",
        }}
        animate={shouldReduce ? {} : { rotate: 360 }}
        transition={{ duration: 10, repeat: INF, ease: "linear" }}
      >
        <div
          className="w-2 h-2 rounded-full shadow-glow-accent"
          style={{ background: "oklch(0.65 0.24 305)" }}
        />
      </motion.div>
      {/* Globe grid overlay */}
      <div
        className="absolute rounded-full overflow-hidden border border-primary/20"
        style={{ inset: 100 }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full opacity-30"
          aria-hidden="true"
        >
          {[30, 60, 90, 120, 150].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="200"
              y2={y}
              stroke="oklch(0.7 0.22 190)"
              strokeWidth="0.8"
            />
          ))}
          {[40, 80, 100, 120, 160].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="200"
              stroke="oklch(0.7 0.22 190)"
              strokeWidth="0.8"
            />
          ))}
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="80"
            fill="none"
            stroke="oklch(0.7 0.22 190)"
            strokeWidth="1.5"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="80"
            ry="30"
            fill="none"
            stroke="oklch(0.7 0.22 190)"
            strokeWidth="1"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="30"
            ry="80"
            fill="none"
            stroke="oklch(0.75 0.2 95)"
            strokeWidth="1"
          />
        </svg>
      </div>
      {/* Center pulse */}
      <motion.div
        className="absolute rounded-full bg-primary/20 shadow-glow-cyan"
        style={{ width: 40, height: 40 }}
        animate={
          shouldReduce ? {} : { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 2.5, repeat: INF, ease: "easeInOut" }}
      />
      <div className="relative z-10 w-6 h-6 rounded-full bg-primary shadow-glow-cyan-lg" />
      {/* HUD labels */}
      <div
        className="absolute font-mono text-xs text-primary/70 tracking-widest"
        style={{ top: 18, right: 18 }}
      >
        SMS·v4.2
      </div>
      <div
        className="absolute font-mono text-xs text-secondary/70 tracking-widest"
        style={{ bottom: 22, left: 16 }}
      >
        LIVE·SYS
      </div>
      <div
        className="absolute font-mono text-[9px] text-accent/60 tracking-widest"
        style={{ top: 22, left: 18 }}
      >
        ENG·CTRL
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Animated counter
// ──────────────────────────────────────────────
function useCountUp(target: string, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const numStr = target.replace(/[^0-9.]/g, "");
    const num = Number.parseFloat(numStr);
    if (Number.isNaN(num)) {
      el.textContent = target;
      return;
    }
    const suffix = target.replace(/[0-9.,]/g, "");
    let start = 0;
    const step = num / (duration / 16);
    const tick = () => {
      start = Math.min(start + step, num);
      const isFloat = target.includes(".");
      const display = isFloat
        ? start.toFixed(1)
        : Math.floor(start).toLocaleString();
      el.textContent = display + suffix;
      if (start < num) requestAnimationFrame(tick);
    };
    tick();
  }, [target, duration]);
  return ref;
}

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const countRef = useCountUp(stat.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      whileHover={{ scale: 1.06, y: -4 }}
      data-ocid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <GlassCard
        glowColor={stat.color}
        className="p-6 text-center relative overflow-hidden"
        hover={false}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`rounded-full border-2 ${stat.ring} opacity-30`}
            style={{ width: 90, height: 90 }}
          />
        </div>
        <span
          ref={countRef}
          className={`relative block text-4xl md:text-5xl font-display font-black mb-2 ${stat.color === "cyan" ? "text-primary" : "text-secondary"}`}
          style={{
            textShadow:
              stat.color === "cyan"
                ? "0 0 30px oklch(0.7 0.22 190 / 0.8), 0 0 60px oklch(0.7 0.22 190 / 0.3)"
                : "0 0 30px oklch(0.75 0.2 95 / 0.8), 0 0 60px oklch(0.75 0.2 95 / 0.3)",
          }}
        >
          {stat.value}
        </span>
        <span className="relative block text-xs font-mono text-muted-foreground uppercase tracking-widest">
          {stat.label}
        </span>
      </GlassCard>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
export function LandingPage() {
  const { isAuthenticated, role } = useAuthStore();
  const dashboardPath =
    role === UserRole.student
      ? "/student"
      : role === UserRole.teacher
        ? "/teacher"
        : role === UserRole.admin
          ? "/admin"
          : "/login";

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <HologramBackground />
      <FloatingParticles />
      <ScanLines />

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/20 glass-effect-darker">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <HUDCircle size={38} color="cyan" speed="slow" innerRing>
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-glow" />
          </HUDCircle>
          <div>
            <span
              className="font-display font-black text-primary tracking-widest text-sm uppercase block leading-none"
              style={{ textShadow: "0 0 16px oklch(0.7 0.22 190 / 0.6)" }}
            >
              HELLOGRAM
            </span>
            <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
              Student Management System
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {isAuthenticated ? (
            <Link to={dashboardPath}>
              <NeonButton variant="primary" data-ocid="nav-dashboard-btn">
                Dashboard
              </NeonButton>
            </Link>
          ) : (
            <>
              <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                Already have an account?
              </span>
              <Link to="/login">
                <NeonButton variant="primary" data-ocid="nav-signin-btn">
                  SIGN IN
                </NeonButton>
              </Link>
            </>
          )}
        </motion.div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-[90vh] flex items-center px-6 lg:px-16 xl:px-24">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-0 py-16 lg:py-0">
          {/* Left: copy */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: INF }}
              />
              <span className="text-xs font-mono text-primary tracking-widest uppercase">
                Next-Generation Academic OS · LIVE
              </span>
            </motion.div>

            {/* Main title block */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mb-6"
            >
              <motion.span
                className="block font-display font-black leading-none text-foreground/90 text-xl md:text-2xl xl:text-3xl tracking-[0.35em] mb-2"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: INF, ease: "easeInOut" }}
              >
                STUDENT MANAGEMENT SYSTEM
              </motion.span>
              <motion.h1
                className="block font-display font-black leading-none"
                animate={{
                  filter: [
                    "brightness(1)",
                    "brightness(1.15)",
                    "brightness(1)",
                  ],
                }}
                transition={{ duration: 3, repeat: INF, ease: "easeInOut" }}
              >
                <span
                  className="block text-6xl md:text-8xl xl:text-9xl text-primary tracking-tight"
                  style={{
                    textShadow:
                      "0 0 40px oklch(0.7 0.22 190 / 1), 0 0 80px oklch(0.7 0.22 190 / 0.5), 0 0 160px oklch(0.7 0.22 190 / 0.2)",
                  }}
                >
                  HELLOGRAM
                </span>
              </motion.h1>
              <span
                className="block text-lg md:text-xl xl:text-2xl text-secondary font-mono tracking-[0.2em] mt-3"
                style={{ textShadow: "0 0 20px oklch(0.75 0.2 95 / 0.6)" }}
              >
                HOLOGRAPHIC · ACADEMIC · OS
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-base md:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
            >
              Unifying students, teachers, and administrators in one holographic
              interface with real-time analytics, AI assistance, and seamless
              outing request management.
            </motion.p>

            {/* Primary CTA — ENTER PORTAL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4"
              data-ocid="hero-cta"
            >
              {isAuthenticated ? (
                <Link to={dashboardPath}>
                  <EnterPortalButton data-ocid="hero-enter-btn" />
                </Link>
              ) : (
                <Link to="/login">
                  <EnterPortalButton data-ocid="hero-enter-btn" />
                </Link>
              )}

              <motion.span
                className="text-xs font-mono text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                or{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 underline transition-colors"
                >
                  Sign in to your account →
                </Link>
              </motion.span>
            </motion.div>

            {/* HUD metrics row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center gap-6 mt-10 flex-wrap justify-center lg:justify-start"
            >
              {["IEEE COMPLIANT", "256-BIT SECURE", "99.9% UPTIME"].map(
                (tag) => (
                  <div key={tag} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                      {tag}
                    </span>
                  </div>
                ),
              )}
            </motion.div>
          </div>

          {/* Right: Orbital HUD — desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:flex flex-shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <OrbitalHUD />
          </motion.div>

          {/* Mobile HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex lg:hidden items-center justify-center"
            aria-hidden="true"
          >
            <div className="scale-[0.6] origin-center">
              <OrbitalHUD />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 border-y border-border/20 bg-muted/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
              <p className="text-xs font-mono text-primary/70 uppercase tracking-[0.25em]">
                SYSTEM STATUS · LIVE
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground/80">
              Real-Time Academic Metrics
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Hero image band ─────────────────────────────────────── */}
      <section className="relative z-10 h-48 md:h-64 overflow-hidden">
        <img
          src="/assets/generated/hologram-hero.dim_1200x600.jpg"
          alt=""
          className="w-full h-full object-cover opacity-40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center px-6"
          >
            <p
              className="font-display font-black text-3xl md:text-5xl text-primary tracking-widest"
              style={{ textShadow: "0 0 40px oklch(0.7 0.22 190 / 0.8)" }}
            >
              ENGINEERED FOR EXCELLENCE
            </p>
            <p className="font-mono text-sm text-secondary/80 tracking-widest mt-2">
              HOLOGRAPHIC INTERFACE · AI-POWERED · REAL-TIME
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Portals / Features ─────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-3">
              CORE MODULES
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              System Capabilities
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every feature engineered for the next generation of academic
              management — from AI assistance to real-time analytics.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {portals.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                data-ocid={`feature-card-${feat.badge.toLowerCase()}`}
              >
                <GlassCard
                  glowColor={feat.color}
                  className="p-6 h-full relative overflow-hidden group"
                >
                  {/* Badge */}
                  <span
                    className={`absolute top-4 right-4 text-[9px] font-mono tracking-widest px-2 py-0.5 rounded border ${feat.borderClass} ${feat.colorClass} ${feat.bgClass}`}
                  >
                    {feat.badge}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-4 ${feat.colorClass} transition-smooth group-hover:scale-110`}
                    style={{ filter: `drop-shadow(${feat.glowStyle})` }}
                  >
                    {feat.icon}
                  </div>

                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>

                  {/* Bottom glow line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-smooth"
                    style={{
                      background: `linear-gradient(to right, transparent, ${feat.colorClass === "text-primary" ? "oklch(0.7 0.22 190)" : feat.colorClass === "text-secondary" ? "oklch(0.75 0.2 95)" : "oklch(0.65 0.24 305)"}, transparent)`,
                    }}
                  />
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA Band ─────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 border-t border-border/20 bg-muted/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-mono text-primary/60 uppercase tracking-widest mb-4">
              READY TO BEGIN?
            </p>
            <h2
              className="text-4xl md:text-6xl font-display font-black text-primary mb-4 leading-none"
              style={{ textShadow: "0 0 40px oklch(0.7 0.22 190 / 0.6)" }}
            >
              ENTER THE PORTAL
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto">
              Join 1,247 students already using the Hellogram Student Management
              System to excel in their academic journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <EnterPortalButton data-ocid="footer-enter-btn" large />
              </Link>
              <p className="text-xs font-mono text-muted-foreground">
                Default admin:{" "}
                <span className="text-secondary font-bold">krishna</span> /{" "}
                <span className="text-secondary font-bold">53083</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 px-6 border-t border-border/20 glass-effect-darker">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HUDCircle size={28} color="cyan" speed="slow">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </HUDCircle>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              HELLOGRAM SMS · STUDENT MANAGEMENT SYSTEM
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              SIGN IN →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────
// Reusable Enter Portal Button
// ──────────────────────────────────────────────
function EnterPortalButton({
  large = false,
  "data-ocid": dataOcid,
}: {
  large?: boolean;
  "data-ocid"?: string;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      whileHover={shouldReduce ? {} : { scale: 1.05 }}
      whileTap={shouldReduce ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      <button
        type="button"
        className={`relative font-display font-black tracking-[0.2em] text-background rounded-lg cursor-pointer overflow-hidden transition-all duration-300
          ${large ? "px-16 py-5 text-lg" : "px-12 py-4 text-base"}`}
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.22 190) 0%, oklch(0.6 0.22 210) 50%, oklch(0.5 0.22 230) 100%)",
          boxShadow:
            "0 0 30px oklch(0.7 0.22 190 / 0.6), 0 0 60px oklch(0.7 0.22 190 / 0.25), 0 4px 20px oklch(0.7 0.22 190 / 0.4), inset 0 1px 0 oklch(0.9 0.1 190 / 0.3)",
        }}
        data-ocid={dataOcid}
      >
        <span className="relative z-10 flex items-center gap-2">
          <span>◆ ENTER PORTAL</span>
        </span>
        {/* Shimmer animation */}
        {!shouldReduce && (
          <motion.div
            className="absolute inset-0 opacity-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, oklch(0.9 0.05 190 / 0.4) 50%, transparent 60%)",
            }}
            animate={{ opacity: [0, 1, 0], x: ["-100%", "100%"] }}
            transition={{
              duration: 2.5,
              repeat: INF,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          />
        )}
      </button>
    </motion.div>
  );
}
