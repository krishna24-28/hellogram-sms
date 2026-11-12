import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  GraduationCap,
  Link2,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { GlassCard } from "../../components/ui/GlassCard";
import { HUDCircle } from "../../components/ui/HUDCircle";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { NeonButton } from "../../components/ui/NeonButton";
import {
  useAssignStudentToTeacher,
  useCreateStudentProfile,
  useCreateTeacherProfile,
  useGetAllOutingRequests,
  useGetAllStudents,
  useGetAllTeachers,
  useGetAssignedStudents,
  useGetUserNotifications,
  useMarkNotificationRead,
  useRegisterWithPassword,
  useRemoveUser,
  useReviewOutingRequest,
} from "../../hooks/useQueries";
import { useAuthStore } from "../../store/authStore";
import { ApprovalStatus, UserRole } from "../../types";
import type { Notification, OutingRequest, UserProfile } from "../../types";

// ── Types ──────────────────────────────────────────────────────────────────────
type AdminSection =
  | "overview"
  | "students"
  | "teachers"
  | "assignments"
  | "approvals"
  | "academic"
  | "notifications";

// ── Static chart data (not mock user data) ─────────────────────────────────────
const GRADE_DIST = [
  { name: "A+", value: 18, color: "oklch(0.7 0.22 190)" },
  { name: "A", value: 28, color: "oklch(0.75 0.2 95)" },
  { name: "B+", value: 24, color: "oklch(0.65 0.24 305)" },
  { name: "B", value: 18, color: "oklch(0.68 0.2 165)" },
  { name: "C", value: 8, color: "oklch(0.72 0.19 225)" },
  { name: "F", value: 4, color: "oklch(0.55 0.2 30)" },
];

const FACULTY_DATA = [
  { faculty: "CSE", students: 128 },
  { faculty: "ECE", students: 96 },
  { faculty: "MECH", students: 74 },
  { faculty: "CIVIL", students: 58 },
  { faculty: "IT", students: 112 },
];

const TOP_STUDENTS = [
  { name: "Ananya Iyer", faculty: "CSE", gpa: "9.8", badge: "🏆" },
  { name: "Rohan Mehta", faculty: "ECE", gpa: "9.6", badge: "🥈" },
  { name: "Priya Nair", faculty: "IT", gpa: "9.4", badge: "🥉" },
  { name: "Arjun Sharma", faculty: "MECH", gpa: "9.2", badge: "⭐" },
  { name: "Vikram Patel", faculty: "CIVIL", gpa: "9.0", badge: "⭐" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(ts: bigint): string {
  const ms = Number(ts);
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const notifIcons: Record<string, React.ReactNode> = {
  approval: <CheckCircle size={14} className="text-primary" />,
  registration: <Users size={14} className="text-secondary" />,
  grade: <BookOpen size={14} className="text-secondary" />,
  attendance: <AlertCircle size={14} className="text-accent" />,
  system: <Shield size={14} className="text-muted-foreground" />,
};

const statusColors: Record<ApprovalStatus, string> = {
  [ApprovalStatus.pending]: "border-secondary/40 text-secondary",
  [ApprovalStatus.approved]: "border-primary/40 text-primary",
  [ApprovalStatus.denied]: "border-accent/40 text-accent",
};

// ── Section skeleton loader ────────────────────────────────────────────────────
function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  const keys = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e", "sk-f"];
  return (
    <div className="space-y-3 pt-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={keys[i] ?? `sk-${i}`}
          className="h-14 w-full rounded-xl"
        />
      ))}
    </div>
  );
}

// ── SubComponents ──────────────────────────────────────────────────────────────
function SectionNav({
  active,
  onChange,
  pendingCount,
  unreadCount,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  pendingCount: number;
  unreadCount: number;
}) {
  const nav: {
    id: AdminSection;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: "overview", label: "Overview", icon: <Shield size={16} /> },
    { id: "students", label: "Students", icon: <GraduationCap size={16} /> },
    { id: "teachers", label: "Teachers", icon: <UserCheck size={16} /> },
    { id: "assignments", label: "Assignments", icon: <Link2 size={16} /> },
    {
      id: "approvals",
      label: "Approvals",
      icon: <CheckCircle size={16} />,
      badge: pendingCount,
    },
    { id: "academic", label: "Academic", icon: <BarChart3 size={16} /> },
    {
      id: "notifications",
      label: "Alerts",
      icon: <Bell size={16} />,
      badge: unreadCount,
    },
  ];
  return (
    <div
      className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
    >
      {nav.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          data-ocid={`admin-nav-${item.id}`}
          className={[
            "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
            active === item.id
              ? "bg-accent/15 text-accent border border-accent/40 shadow-glow-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
          ].join(" ")}
        >
          {item.icon}
          <span className="hidden sm:inline">{item.label}</span>
          {(item.badge ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center shadow-glow-accent">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "cyan" | "yellow" | "magenta";
  sub?: string;
}) {
  const colorMap = {
    cyan: "text-primary",
    yellow: "text-secondary",
    magenta: "text-accent",
  };
  const hudMap: Record<string, "cyan" | "yellow" | "magenta"> = {
    cyan: "cyan",
    yellow: "yellow",
    magenta: "magenta",
  };
  return (
    <GlassCard glowColor={color} className="p-4 flex items-center gap-4" hover>
      <HUDCircle size={52} color={hudMap[color]} speed="slow" innerRing>
        <span className={colorMap[color]}>{icon}</span>
      </HUDCircle>
      <div className="min-w-0 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-2xl font-display font-black ${colorMap[color]}`}
        >
          {value}
        </motion.div>
        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider truncate">
          {label}
        </div>
        {sub && (
          <div className="text-xs text-muted-foreground/60 mt-0.5">{sub}</div>
        )}
      </div>
    </GlassCard>
  );
}

// ── Section 1: Overview ────────────────────────────────────────────────────────
function OverviewSection({
  students,
  teachers,
  outingRequests,
  notifications,
  studentsLoading,
  teachersLoading,
}: {
  students: UserProfile[];
  teachers: UserProfile[];
  outingRequests: OutingRequest[];
  notifications: Notification[];
  studentsLoading: boolean;
  teachersLoading: boolean;
}) {
  const pending = outingRequests.filter(
    (r) => r.status === ApprovalStatus.pending,
  );
  const recentActivity = [...notifications]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 5);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl glass-effect border border-accent/30 p-6 shadow-glow-accent">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-secondary/5 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <HUDCircle size={72} color="magenta" speed="slow" innerRing>
            <Shield size={24} className="text-accent" />
          </HUDCircle>
          <div>
            <h1 className="text-3xl font-display font-black text-foreground tracking-tight">
              SYSTEM CONTROL CENTER
            </h1>
            <p className="text-sm font-mono text-accent/80 mt-1">
              ◉ ALL SYSTEMS NOMINAL — ADMIN CLEARANCE LEVEL 5
            </p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-2 rounded-lg glass-effect-darker border border-primary/30">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">LIVE DATA</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {studentsLoading || teachersLoading ? (
          ["s1", "s2", "s3", "s4"].map((k) => (
            <Skeleton key={k} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={<GraduationCap size={20} />}
              label="Total Students"
              value={students.length}
              color="cyan"
              sub="Enrolled"
            />
            <StatCard
              icon={<UserCheck size={20} />}
              label="Total Teachers"
              value={teachers.length}
              color="yellow"
              sub="Faculty"
            />
            <StatCard
              icon={<MapPin size={20} />}
              label="Pending Approvals"
              value={pending.length}
              color="magenta"
              sub="Need review"
            />
            <StatCard
              icon={<BookOpen size={20} />}
              label="Active Courses"
              value={12}
              color="cyan"
              sub="This semester"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* System Health */}
        <GlassCard className="p-5" glowColor="cyan">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            System Health
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Backend Canister",
                status: "Operational",
                pct: 100,
                color: "bg-primary",
              },
              {
                label: "Authentication",
                status: "Operational",
                pct: 100,
                color: "bg-primary",
              },
              {
                label: "Data Storage",
                status: "98% Utilized",
                pct: 98,
                color: "bg-secondary",
              },
              {
                label: "AI Services",
                status: "Active",
                pct: 95,
                color: "bg-primary",
              },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="text-primary font-mono">{s.status}</span>
                </div>
                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${s.color} shadow-glow-cyan`}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity Feed */}
        <GlassCard className="p-5" glowColor="magenta">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell size={16} className="text-accent" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg glass-effect-darker border border-border/20"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notifIcons[n.notifType] ?? <Bell size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground leading-snug">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1" />
                  )}
                </motion.div>
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

// ── Section 2: Students ────────────────────────────────────────────────────────
const StudentsSection = memo(function StudentsSection({
  students,
  loading,
}: {
  students: UserProfile[];
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    faculty: "CSE",
    year: "1",
  });
  const [addError, setAddError] = useState("");
  const removeUser = useRemoveUser();
  const registerWithPw = useRegisterWithPassword();
  const createStudentProfile = useCreateStudentProfile();

  const PAGE_SIZE = 8;
  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [students, search],
  );

  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleAdd = async () => {
    setAddError("");
    if (
      !addForm.username ||
      !addForm.password ||
      !addForm.displayName ||
      !addForm.email
    ) {
      setAddError("All fields except faculty/year are required.");
      return;
    }
    try {
      const userId = await registerWithPw.mutateAsync({
        username: addForm.username.trim(),
        password: addForm.password.trim(),
        name: addForm.displayName.trim(),
        email: addForm.email.trim(),
        role: UserRole.student,
      });
      if (typeof userId === "string" && userId) {
        await createStudentProfile.mutateAsync({
          userId,
          faculty: addForm.faculty || "CSE",
          year: Number(addForm.year) || 1,
        });
      }
      setAddForm({
        username: "",
        password: "",
        displayName: "",
        email: "",
        faculty: "CSE",
        year: "1",
      });
      setShowAdd(false);
      toast.success("Student added successfully!");
    } catch (e) {
      setAddError(
        e instanceof Error
          ? e.message
          : "Failed to add student. Try a different username.",
      );
    }
  };

  const isPending = registerWithPw.isPending || createStudentProfile.isPending;

  return (
    <motion.div
      key="students"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <GraduationCap size={20} className="text-primary" />
          Student Management
          <Badge
            variant="outline"
            className="border-primary/40 text-primary ml-2"
          >
            {filtered.length}
          </Badge>
        </h2>
        <div className="flex gap-2 ml-auto">
          <NeonButton
            variant="primary"
            onClick={() => setShowAdd(true)}
            data-ocid="add-student-btn"
          >
            <Plus size={14} /> Add Student
          </NeonButton>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          data-ocid="student-search"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden" glowColor="cyan">
        {loading ? (
          <div className="p-5">
            <SectionSkeleton rows={5} />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <GraduationCap size={36} className="opacity-20" />
            <p className="text-sm">No students enrolled yet</p>
            <NeonButton variant="primary" onClick={() => setShowAdd(true)}>
              <Plus size={14} /> Add First Student
            </NeonButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  {["Student", "Email", "Enrolled", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-mono text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/10 hover:bg-primary/5 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-xs font-display font-bold text-primary flex-shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                      {s.email}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {timeAgo(s.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          type="button"
                          aria-label="View"
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Eye size={13} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              aria-label="Remove"
                              data-ocid="remove-student-btn"
                              className="p-1.5 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-effect border-border/30">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">
                                Remove Student
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Remove{" "}
                                <strong className="text-foreground">
                                  {s.name}
                                </strong>{" "}
                                permanently? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="glass-effect-darker">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeUser.mutate(s.id)}
                                className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
            <span className="text-xs font-mono text-muted-foreground">
              Page {page + 1} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(pages - 1, page + 1))}
                disabled={page === pages - 1}
                className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground disabled:opacity-40 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-effect rounded-2xl border border-primary/30 p-6 shadow-glow-cyan max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Plus size={16} className="text-primary" /> Add New Student
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError("");
                  }}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: "username",
                    label: "Username",
                    placeholder: "arjun_sharma",
                    type: "text",
                  },
                  {
                    key: "password",
                    label: "Password",
                    placeholder: "Min 6 characters",
                    type: "password",
                  },
                  {
                    key: "displayName",
                    label: "Full Name",
                    placeholder: "Arjun Sharma",
                    type: "text",
                  },
                  {
                    key: "email",
                    label: "Email",
                    placeholder: "arjun@university.edu",
                    type: "email",
                  },
                  {
                    key: "faculty",
                    label: "Faculty (e.g. CSE, ECE)",
                    placeholder: "CSE",
                    type: "text",
                  },
                  {
                    key: "year",
                    label: "Year",
                    placeholder: "1",
                    type: "number",
                  },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label
                      htmlFor={`add-student-${key}`}
                      className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block"
                    >
                      {label}
                    </label>
                    <input
                      id={`add-student-${key}`}
                      type={type}
                      value={addForm[key as keyof typeof addForm]}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      data-ocid={`add-student-${key}`}
                      className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              {addError && (
                <p className="mt-3 text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}
              <div className="flex gap-3 mt-5">
                <NeonButton
                  variant="ghost"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
                <NeonButton
                  variant="primary"
                  onClick={handleAdd}
                  loading={isPending}
                  className="flex-1"
                  data-ocid="add-student-submit"
                >
                  Add Student
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// ── Section 3: Teachers ────────────────────────────────────────────────────────
const TeachersSection = memo(function TeachersSection({
  teachers,
  loading,
}: { teachers: UserProfile[]; loading: boolean }) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudentsId, setViewStudentsId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    username: "",
    password: "",
    displayName: "",
    email: "",
    subject: "",
  });
  const [addError, setAddError] = useState("");
  const removeUser = useRemoveUser();
  const registerWithPw = useRegisterWithPassword();
  const createTeacherProfile = useCreateTeacherProfile();

  const handleAdd = async () => {
    setAddError("");
    if (
      !addForm.username ||
      !addForm.password ||
      !addForm.displayName ||
      !addForm.email
    ) {
      setAddError("Username, password, name, and email are required.");
      return;
    }
    try {
      const userId = await registerWithPw.mutateAsync({
        username: addForm.username.trim(),
        password: addForm.password.trim(),
        name: addForm.displayName.trim(),
        email: addForm.email.trim(),
        role: UserRole.teacher,
      });
      if (typeof userId === "string" && userId && addForm.subject) {
        await createTeacherProfile.mutateAsync({
          userId,
          subject: addForm.subject.trim(),
        });
      }
      setAddForm({
        username: "",
        password: "",
        displayName: "",
        email: "",
        subject: "",
      });
      setShowAdd(false);
      toast.success("Teacher added successfully!");
    } catch (e) {
      setAddError(
        e instanceof Error
          ? e.message
          : "Failed to add teacher. Try a different username.",
      );
    }
  };

  const isPending = registerWithPw.isPending || createTeacherProfile.isPending;

  return (
    <motion.div
      key="teachers"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <UserCheck size={20} className="text-secondary" />
          Teacher Management
          <Badge
            variant="outline"
            className="border-secondary/40 text-secondary ml-2"
          >
            {teachers.length}
          </Badge>
        </h2>
        <NeonButton
          variant="secondary"
          onClick={() => setShowAdd(true)}
          className="ml-auto"
          data-ocid="add-teacher-btn"
        >
          <Plus size={14} /> Add Teacher
        </NeonButton>
      </div>

      {loading ? (
        <SectionSkeleton rows={3} />
      ) : teachers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground glass-effect rounded-xl border border-border/20">
          <UserCheck size={36} className="opacity-20" />
          <p className="text-sm">No teachers added yet</p>
          <NeonButton variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Add First Teacher
          </NeonButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-5" glowColor="yellow" hover>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-sm font-display font-bold text-secondary flex-shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-display font-semibold text-foreground truncate">
                        {t.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {t.email}
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        aria-label="Remove teacher"
                        data-ocid="remove-teacher-btn"
                        className="p-1.5 rounded text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-effect border-border/30">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">
                          Remove Teacher
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Remove{" "}
                          <strong className="text-foreground">{t.name}</strong>{" "}
                          from the system?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="glass-effect-darker">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeUser.mutate(t.id)}
                          className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-secondary/30 text-secondary/80 text-xs"
                  >
                    <BookOpen size={10} className="mr-1" /> Faculty
                  </Badge>
                  <button
                    type="button"
                    onClick={() =>
                      setViewStudentsId(viewStudentsId === t.id ? null : t.id)
                    }
                    className="text-xs font-mono text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    data-ocid="view-teacher-students-btn"
                  >
                    <Users size={11} /> View Students
                  </button>
                </div>
                <AnimatePresence>
                  {viewStudentsId === t.id && (
                    <TeacherStudentsList teacherId={t.id} />
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-effect rounded-2xl border border-secondary/30 p-6 shadow-glow-yellow max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Plus size={16} className="text-secondary" /> Add New Teacher
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError("");
                  }}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  {
                    key: "username",
                    label: "Username",
                    placeholder: "dr_sunita",
                    type: "text",
                  },
                  {
                    key: "password",
                    label: "Password",
                    placeholder: "Min 6 characters",
                    type: "password",
                  },
                  {
                    key: "displayName",
                    label: "Full Name",
                    placeholder: "Dr. Sunita Rao",
                    type: "text",
                  },
                  {
                    key: "email",
                    label: "Email",
                    placeholder: "sunita@university.edu",
                    type: "email",
                  },
                  {
                    key: "subject",
                    label: "Subject",
                    placeholder: "Computer Science",
                    type: "text",
                  },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label
                      htmlFor={`add-teacher-${key}`}
                      className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1 block capitalize"
                    >
                      {label}
                    </label>
                    <input
                      id={`add-teacher-${key}`}
                      type={type}
                      value={addForm[key as keyof typeof addForm]}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      data-ocid={`add-teacher-${key}`}
                      className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              {addError && (
                <p className="mt-3 text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}
              <div className="flex gap-3 mt-5">
                <NeonButton
                  variant="ghost"
                  onClick={() => {
                    setShowAdd(false);
                    setAddError("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
                <NeonButton
                  variant="secondary"
                  onClick={handleAdd}
                  loading={isPending}
                  className="flex-1"
                  data-ocid="add-teacher-submit"
                >
                  Add Teacher
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

function TeacherStudentsList({ teacherId }: { teacherId: string }) {
  const { data: assigned = [] } = useGetAssignedStudents(teacherId);
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 pt-3 border-t border-border/20 space-y-1 overflow-hidden"
    >
      {assigned.length > 0 ? (
        assigned.map((s) => (
          <div
            key={s.id}
            className="text-xs text-muted-foreground font-mono truncate"
          >
            • {s.name}
          </div>
        ))
      ) : (
        <div className="text-xs text-muted-foreground/60">
          No students assigned yet
        </div>
      )}
    </motion.div>
  );
}

// ── Section 4: Assignments ─────────────────────────────────────────────────────
function AssignmentsSection({
  students,
  teachers,
}: { students: UserProfile[]; teachers: UserProfile[] }) {
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const assign = useAssignStudentToTeacher();

  const { data: currentlyAssigned = [] } = useGetAssignedStudents(
    selectedTeacher?.id,
  );

  const toggle = (studentId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(studentId) ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    try {
      for (const sid of savedIds) {
        await assign.mutateAsync({
          teacherId: selectedTeacher.id,
          studentId: sid,
        });
      }
      setSavedIds(new Set());
      toast.success("Assignments saved!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      key="assignments"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <Link2 size={20} className="text-primary" /> Teacher–Student Assignments
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard className="p-5" glowColor="cyan">
          <h3 className="text-sm font-display font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Select Teacher
          </h3>
          {teachers.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No teachers available
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teachers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTeacher(t);
                    setSavedIds(new Set());
                  }}
                  data-ocid="select-teacher-btn"
                  className={[
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                    selectedTeacher?.id === t.id
                      ? "bg-primary/15 border border-primary/40 shadow-glow-cyan text-primary"
                      : "glass-effect-darker border border-border/20 text-foreground hover:border-primary/30",
                  ].join(" ")}
                >
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display font-bold flex-shrink-0 ${selectedTeacher?.id === t.id ? "border-primary/60 bg-primary/20 text-primary" : "border-secondary/40 bg-secondary/10 text-secondary"}`}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="text-xs font-mono text-muted-foreground truncate">
                      {t.email}
                    </div>
                  </div>
                  {selectedTeacher?.id === t.id && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" glowColor="yellow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">
              {selectedTeacher
                ? `Assign to ${selectedTeacher.name.split(" ")[0]}`
                : "Select a teacher first"}
            </h3>
            {savedIds.size > 0 && (
              <Badge
                variant="outline"
                className="border-secondary/40 text-secondary text-xs"
              >
                {savedIds.size} selected
              </Badge>
            )}
          </div>
          {selectedTeacher ? (
            <>
              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {students.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
                    No students available
                  </div>
                ) : (
                  students.map((s) => {
                    const alreadyAssigned = currentlyAssigned.some(
                      (ca) => ca.id === s.id,
                    );
                    const isSelected = savedIds.has(s.id);
                    return (
                      <label
                        key={s.id}
                        className={[
                          "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                          alreadyAssigned
                            ? "glass-effect-darker border border-primary/30 opacity-60"
                            : isSelected
                              ? "bg-secondary/10 border border-secondary/40"
                              : "glass-effect-darker border border-border/20 hover:border-secondary/30",
                        ].join(" ")}
                        data-ocid="assign-student-checkbox"
                      >
                        <input
                          type="checkbox"
                          checked={alreadyAssigned || isSelected}
                          disabled={alreadyAssigned}
                          onChange={() => toggle(s.id)}
                          className="accent-secondary flex-shrink-0"
                        />
                        <div className="w-7 h-7 rounded-full border border-secondary/30 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary flex-shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-foreground truncate">
                            {s.name}
                          </div>
                          <div className="text-xs text-muted-foreground/70 font-mono truncate">
                            {s.email}
                          </div>
                        </div>
                        {alreadyAssigned && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary text-[10px]"
                          >
                            Assigned
                          </Badge>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
              <NeonButton
                variant="secondary"
                fullWidth
                onClick={handleSave}
                loading={saving}
                disabled={savedIds.size === 0}
                data-ocid="save-assignments-btn"
              >
                Save {savedIds.size > 0 ? `${savedIds.size} ` : ""}Assignments
              </NeonButton>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Link2 size={24} className="opacity-30" />
              <span className="text-sm">Pick a teacher to assign students</span>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}

// ── Section 5: Approvals ───────────────────────────────────────────────────────
const ApprovalsSection = memo(function ApprovalsSection({
  outingRequests,
  loading,
  userId,
}: {
  outingRequests: OutingRequest[];
  loading: boolean;
  userId: string | undefined;
}) {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [comments, setComments] = useState<Record<string, string>>({});
  const reviewRequest = useReviewOutingRequest();
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const pending = outingRequests.filter(
    (r) => r.status === ApprovalStatus.pending,
  );
  const history = outingRequests.filter(
    (r) => r.status !== ApprovalStatus.pending,
  );

  const handleReview = async (req: OutingRequest, status: ApprovalStatus) => {
    if (!userId) {
      toast.error("Not authenticated. Please reload.");
      return;
    }
    setReviewingId(req.id);
    try {
      await reviewRequest.mutateAsync({
        requestId: req.id,
        status,
        comment: comments[req.id] ?? null,
        reviewerId: userId,
      });
      toast.success(
        status === ApprovalStatus.approved
          ? "Request approved successfully ✓"
          : "Request denied",
      );
      setComments((c) => {
        const next = { ...c };
        delete next[req.id];
        return next;
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update request");
    } finally {
      setReviewingId(null);
    }
  };

  const RequestCard = ({ req }: { req: OutingRequest }) => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl glass-effect-darker border border-border/20 space-y-3 hover:border-accent/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full border border-accent/40 bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
              {req.studentId.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground font-mono">
              {req.studentId.slice(0, 8)}…
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-border/40 text-muted-foreground text-xs"
            >
              <MapPin size={9} className="mr-1" />
              {formatDate(req.startDate)} → {formatDate(req.endDate)}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${statusColors[req.status]}`}
            >
              {req.status}
            </Badge>
          </div>
        </div>
        <span className="text-xs font-mono text-muted-foreground/60 flex-shrink-0">
          {timeAgo(req.createdAt)}
        </span>
      </div>
      <p className="text-sm text-foreground/90 bg-muted/20 rounded-lg px-3 py-2 border border-border/10 italic">
        "{req.reason}"
      </p>
      {req.status === ApprovalStatus.pending && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Optional comment…"
            value={comments[req.id] ?? ""}
            onChange={(e) =>
              setComments((c) => ({ ...c, [req.id]: e.target.value }))
            }
            data-ocid="review-comment-input"
            className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
          />
          <div className="flex gap-2">
            <NeonButton
              variant="primary"
              onClick={() => handleReview(req, ApprovalStatus.approved)}
              loading={reviewingId === req.id && reviewRequest.isPending}
              className="flex-1 text-xs py-1.5"
              data-ocid="admin-approve-btn"
            >
              <CheckCircle size={13} /> Approve
            </NeonButton>
            <NeonButton
              variant="danger"
              onClick={() => handleReview(req, ApprovalStatus.denied)}
              loading={reviewingId === req.id && reviewRequest.isPending}
              className="flex-1 text-xs py-1.5"
              data-ocid="admin-deny-btn"
            >
              <XCircle size={13} /> Deny
            </NeonButton>
          </div>
        </div>
      )}
      {req.reviewComment && (
        <p className="text-xs text-muted-foreground font-mono">
          Comment: {req.reviewComment}
        </p>
      )}
    </motion.div>
  );

  return (
    <motion.div
      key="approvals"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <CheckCircle size={20} className="text-accent" /> Approvals Center
      </h2>

      <div className="flex gap-2 border-b border-border/20 pb-1">
        {(["pending", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            data-ocid={`approvals-tab-${t}`}
            className={[
              "relative px-4 py-2 text-sm font-display font-medium transition-all duration-200 rounded-t-lg",
              tab === t
                ? "text-accent border-b-2 border-accent"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t === "pending" ? "Pending Requests" : "History"}
            {t === "pending" && pending.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <SectionSkeleton rows={3} />
      ) : (
        <div className="space-y-3">
          {(tab === "pending" ? pending : history).map((req) => (
            <RequestCard key={req.id} req={req} />
          ))}
          {(tab === "pending" ? pending : history).length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <CheckCircle size={28} className="opacity-20" />
              <span className="text-sm">
                {tab === "pending"
                  ? "No pending requests — all clear!"
                  : "No history yet"}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
});

// ── Section 6: Academic Overview ───────────────────────────────────────────────
function AcademicSection(_props: { students: UserProfile[] }) {
  const attendanceRate = 82;

  return (
    <motion.div
      key="academic"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-5"
    >
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <BarChart3 size={20} className="text-secondary" /> Academic Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard
          className="p-5 flex flex-col items-center justify-center gap-3"
          glowColor="cyan"
        >
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Overall Attendance
          </h3>
          <HUDCircle size={110} color="cyan" speed="slow" innerRing>
            <div className="text-center">
              <div className="text-2xl font-display font-black text-primary">
                {attendanceRate}%
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Avg rate
              </div>
            </div>
          </HUDCircle>
          <p className="text-xs text-muted-foreground text-center">
            System-wide attendance across all faculties
          </p>
        </GlassCard>

        <GlassCard className="p-5 col-span-1 md:col-span-2" glowColor="yellow">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
            Grade Distribution
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={GRADE_DIST}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={62}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {GRADE_DIST.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.16 0.012 245 / 0.9)",
                    border: "1px solid oklch(0.25 0.012 245 / 0.4)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  labelStyle={{ color: "oklch(0.95 0.01 245)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {GRADE_DIST.map((g) => (
                <div key={g.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: g.color }}
                  />
                  <span className="text-muted-foreground font-mono">
                    {g.name}
                  </span>
                  <span className="text-foreground font-bold ml-auto">
                    {g.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5" glowColor="magenta">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Faculty Enrollment
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={FACULTY_DATA} barCategoryGap="35%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.012 245 / 0.3)"
            />
            <XAxis
              dataKey="faculty"
              tick={{
                fill: "oklch(0.6 0.008 245)",
                fontSize: 11,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "oklch(0.6 0.008 245)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.16 0.012 245 / 0.9)",
                border: "1px solid oklch(0.25 0.012 245 / 0.4)",
                borderRadius: "8px",
                fontSize: "11px",
              }}
            />
            <Bar
              dataKey="students"
              fill="oklch(0.7 0.22 190)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard className="p-5" glowColor="cyan">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
          Top Performing Students
        </h3>
        <div className="space-y-2">
          {TOP_STUDENTS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-2.5 rounded-lg glass-effect-darker border border-border/20"
            >
              <span className="text-lg w-6 text-center flex-shrink-0">
                {s.badge}
              </span>
              <div className="w-7 h-7 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground font-medium">
                  {s.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {s.faculty}
                </div>
              </div>
              <div className="text-sm font-display font-bold text-secondary">
                {s.gpa}
              </div>
              <div className="w-20 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(Number.parseFloat(s.gpa) / 10) * 100}%`,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className="h-full bg-secondary rounded-full shadow-glow-yellow"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Section 7: Notifications ───────────────────────────────────────────────────
function NotificationsSection({
  notifications,
  userId,
}: {
  notifications: Notification[];
  userId: string | undefined;
}) {
  const [filter, setFilter] = useState("all");
  const markRead = useMarkNotificationRead();

  const types = [
    "all",
    "approval",
    "registration",
    "grade",
    "attendance",
    "system",
  ];
  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.notifType === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <Bell size={20} className="text-accent" /> System Notifications
        {unreadCount > 0 && (
          <Badge
            variant="outline"
            className="border-accent/40 text-accent ml-2"
          >
            {unreadCount} unread
          </Badge>
        )}
      </h2>

      <div
        className="flex gap-2 flex-wrap"
        role="toolbar"
        aria-label="Notification filters"
      >
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            data-ocid={`notif-filter-${t}`}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all duration-200",
              filter === t
                ? "bg-accent/15 border border-accent/40 text-accent shadow-glow-accent"
                : "glass-effect-darker border border-border/20 text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <Filter size={10} />
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Bell size={28} className="opacity-20" />
          <span className="text-sm">No notifications yet</span>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={[
                "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
                n.read
                  ? "glass-effect-darker border-border/15 opacity-70"
                  : "glass-effect border-accent/20 hover:border-accent/40",
              ].join(" ")}
              data-ocid="notification-row"
            >
              <div className="mt-0.5 flex-shrink-0">
                {notifIcons[n.notifType] ?? <Bell size={14} />}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-muted-foreground/60">
                    {timeAgo(n.createdAt)}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-border/30 text-muted-foreground/70 text-[10px] capitalize"
                  >
                    {n.notifType}
                  </Badge>
                </div>
              </div>
              {!n.read && userId && (
                <button
                  type="button"
                  onClick={() => markRead.mutate({ notifId: n.id, userId })}
                  className="flex-shrink-0 p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all text-xs font-mono"
                  aria-label="Mark as read"
                  data-ocid="mark-read-btn"
                >
                  <CheckCircle size={14} />
                </button>
              )}
              {n.read && (
                <div className="flex-shrink-0 text-muted-foreground/30 text-xs font-mono">
                  read
                </div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Bell size={28} className="opacity-20" />
              <span className="text-sm">
                No {filter !== "all" ? filter : ""} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [section, setSection] = useState<AdminSection>("overview");

  const { data: studentInfos = [], isLoading: studentsLoading } =
    useGetAllStudents();
  const { data: teacherInfos = [], isLoading: teachersLoading } =
    useGetAllTeachers();
  const students: UserProfile[] = studentInfos.map((s) => s.profile);
  const teachers: UserProfile[] = teacherInfos.map((t) => t.profile);
  const { data: outingRequests = [], isLoading: requestsLoading } =
    useGetAllOutingRequests();
  const { data: notifications = [] } = useGetUserNotifications(userId);

  const pending = outingRequests.filter(
    (r) => r.status === ApprovalStatus.pending,
  ).length;
  const unread = notifications.filter((n) => !n.read).length;

  // Only block on first load when no cached data exists at all
  const isFirstLoad =
    studentsLoading &&
    teachersLoading &&
    students.length === 0 &&
    teachers.length === 0;

  if (isFirstLoad) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        activeSection={section}
        onNavSelect={(s) => setSection(s as AdminSection)}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" label="INITIALIZING SYSTEM DATA" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="System Control Center"
      activeSection={section}
      onNavSelect={(s) => setSection(s as AdminSection)}
    >
      <div className="space-y-5 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SectionNav
            active={section}
            onChange={setSection}
            pendingCount={pending}
            unreadCount={unread}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {section === "overview" && (
            <OverviewSection
              key="overview"
              students={students}
              teachers={teachers}
              outingRequests={outingRequests}
              notifications={notifications}
              studentsLoading={studentsLoading}
              teachersLoading={teachersLoading}
            />
          )}
          {section === "students" && (
            <StudentsSection
              key="students"
              students={students}
              loading={studentsLoading}
            />
          )}
          {section === "teachers" && (
            <TeachersSection
              key="teachers"
              teachers={teachers}
              loading={teachersLoading}
            />
          )}
          {section === "assignments" && (
            <AssignmentsSection
              key="assignments"
              students={students}
              teachers={teachers}
            />
          )}
          {section === "approvals" && (
            <ApprovalsSection
              key="approvals"
              outingRequests={outingRequests}
              loading={requestsLoading}
              userId={userId}
            />
          )}
          {section === "academic" && (
            <AcademicSection key="academic" students={students} />
          )}
          {section === "notifications" && (
            <NotificationsSection
              key="notifications"
              notifications={notifications}
              userId={userId}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
