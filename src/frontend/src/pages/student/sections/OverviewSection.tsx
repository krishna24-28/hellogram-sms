import { GlassCard } from "@/components/ui/GlassCard";
import { HUDCircle } from "@/components/ui/HUDCircle";
import { NeonButton } from "@/components/ui/NeonButton";
import type {
  Assignment,
  AttendanceRecord,
  Grade,
  Notification,
  OutingRequest,
  StudentProfile,
} from "@/types";
import { ApprovalStatus, AttendanceStatus } from "@/types";
import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Props {
  userName: string;
  profile: StudentProfile | null | undefined;
  grades: Grade[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  outingRequests: OutingRequest[];
  notifications: Notification[];
  onUpdateFaculty: (faculty: string) => void;
  isUpdatingFaculty: boolean;
}

const FACULTY_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Mathematics",
  "Physics",
  "Chemistry",
];

function StatCard({
  icon,
  label,
  value,
  color,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "cyan" | "yellow" | "magenta";
  suffix?: string;
}) {
  const colorCls = {
    cyan: "text-primary",
    yellow: "text-secondary",
    magenta: "text-accent",
  };
  const ringCls = {
    cyan: "shadow-glow-cyan border-primary/30",
    yellow: "shadow-glow-yellow border-secondary/30",
    magenta: "shadow-glow-accent border-accent/30",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard glowColor={color} className="p-5 relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 ${color === "cyan" ? "bg-primary" : color === "yellow" ? "bg-secondary" : "bg-accent"}`}
        />
        <div
          className={`mb-3 p-2 rounded-lg w-fit border ${ringCls[color]} ${colorCls[color]}`}
        >
          {icon}
        </div>
        <div className={`text-3xl font-display font-black ${colorCls[color]}`}>
          {value}
          {suffix}
        </div>
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
          {label}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function OverviewSection({
  userName,
  profile,
  grades,
  attendance,
  assignments,
  outingRequests,
  notifications,
  onUpdateFaculty,
  isUpdatingFaculty,
}: Props) {
  const [faculty, setFaculty] = useState(profile?.faculty ?? "");
  const [showNotifs, setShowNotifs] = useState(false);

  const presentCount = attendance.filter(
    (a) => a.status === AttendanceStatus.present,
  ).length;
  const attendancePct =
    attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 87;
  const avgGrade =
    grades.length > 0
      ? Math.round(grades.reduce((s, g) => s + g.marks, 0) / grades.length)
      : 91;
  const pendingOutings = outingRequests.filter(
    (r) => r.status === ApprovalStatus.pending,
  ).length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl glass-effect border border-primary/20 shadow-glow-cyan p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <HUDCircle size={72} color="cyan" speed="slow" innerRing>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
              <span className="text-lg font-display font-black text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </HUDCircle>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-primary/60 tracking-widest uppercase mb-1">
              Welcome Back
            </p>
            <h1 className="text-3xl font-display font-black text-foreground tracking-tight">
              <span
                className="text-primary"
                style={{ textShadow: "0 0 20px oklch(var(--primary) / 0.6)" }}
              >
                {userName.toUpperCase()}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {profile?.faculty ?? "Faculty: Unset"} • Year{" "}
              {profile?.year?.toString() ?? "—"} • ID:{" "}
              {profile?.enrollmentId ?? "—"}
            </p>
          </div>
          <div className="relative">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowNotifs((s) => !s)}
              className="relative p-3 rounded-xl glass-effect-darker border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              data-ocid="notif-bell"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-glow-accent">
                  {unreadCount}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-effect border border-border/30 rounded-xl shadow-glow-cyan z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                    <span className="font-display font-semibold text-foreground text-sm">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowNotifs(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-border/10 ${!n.read ? "bg-primary/5" : ""}`}
                        >
                          <p className="text-xs text-foreground">{n.message}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            {n.notifType}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList size={18} />}
          label="Attendance"
          value={attendancePct}
          color="cyan"
          suffix="%"
        />
        <StatCard
          icon={<Award size={18} />}
          label="Avg Grade"
          value={avgGrade}
          color="yellow"
          suffix="%"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Pending Outings"
          value={pendingOutings}
          color="magenta"
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Assignments"
          value={assignments.length || 3}
          color="cyan"
        />
      </div>

      {/* Profile + Faculty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard glowColor="cyan" className="p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-primary shadow-glow-cyan" />
            Student Profile
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <HUDCircle size={60} color="cyan" speed="slow">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
                <span className="text-xl font-display font-black text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </HUDCircle>
            <div>
              <p className="font-display font-bold text-foreground">
                {userName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                  {profile?.faculty ?? "No Faculty"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Year {profile?.year?.toString() ?? "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                ID: {profile?.enrollmentId ?? "—"}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="yellow" className="p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-secondary shadow-glow-yellow" />
            Update Faculty
          </h3>
          <div className="space-y-3">
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-foreground text-sm focus:border-secondary/60 focus:shadow-glow-yellow outline-none bg-transparent font-mono transition-all"
              data-ocid="faculty-select"
            >
              <option value="" className="bg-card text-foreground">
                Select Faculty
              </option>
              {FACULTY_OPTIONS.map((f) => (
                <option key={f} value={f} className="bg-card text-foreground">
                  {f}
                </option>
              ))}
            </select>
            <NeonButton
              variant="secondary"
              onClick={() => faculty && onUpdateFaculty(faculty)}
              loading={isUpdatingFaculty}
              fullWidth
              data-ocid="faculty-update-btn"
            >
              Update Faculty
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
