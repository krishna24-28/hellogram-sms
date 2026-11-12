import { Bell, BookOpen, CheckSquare, MapPin, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { HUDCircle } from "../../../components/ui/HUDCircle";
import { NeonButton } from "../../../components/ui/NeonButton";
import type {
  Assignment,
  OutingRequest,
  TeacherProfile,
  UserProfile,
} from "../../../types";

interface Props {
  user: UserProfile | null;
  profile: TeacherProfile | null;
  students: UserProfile[];
  pendingRequests: OutingRequest[];
  assignments: Assignment[];
  unreadNotifs: number;
  onNavigate: (
    section:
      | "overview"
      | "students"
      | "attendance"
      | "grades"
      | "assignments"
      | "outing"
      | "analytics",
  ) => void;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "cyan" | "yellow" | "magenta";
}) {
  const colorMap = {
    cyan: "text-primary",
    yellow: "text-secondary",
    magenta: "text-accent",
  };
  return (
    <GlassCard glowColor={color} className="p-4">
      <div className={`mb-2 ${colorMap[color]}`}>{icon}</div>
      <div className="text-2xl font-display font-black text-foreground">
        {value}
      </div>
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
        {label}
      </div>
    </GlassCard>
  );
}

export function TeacherOverview({
  user,
  profile,
  students,
  pendingRequests,
  assignments,
  unreadNotifs,
  onNavigate,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard glowColor="yellow" className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <HUDCircle size={72} color="yellow" speed="slow" innerRing>
              <span className="text-2xl font-display font-black text-secondary">
                {user?.name.charAt(0).toUpperCase() ?? "T"}
              </span>
            </HUDCircle>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-black text-foreground">
                  {user?.name ?? "Teacher"}
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-secondary/10 border border-secondary/30 text-secondary uppercase tracking-wider">
                  TEACHER
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {user?.email ?? ""}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm">
                  <Star size={14} className="text-secondary" />
                  <span className="text-foreground font-medium">Subject:</span>
                  <span className="text-secondary font-mono">
                    {profile?.subject ?? "Unassigned"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Users size={14} className="text-primary" />
                  <span className="text-muted-foreground">
                    {students.length} Students Assigned
                  </span>
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={<Users size={20} />}
          label="Assigned Students"
          value={students.length}
          color="yellow"
        />
        <StatCard
          icon={<MapPin size={20} />}
          label="Pending Requests"
          value={pendingRequests.length}
          color="magenta"
        />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Assignments Posted"
          value={assignments.length}
          color="cyan"
        />
        <StatCard
          icon={<Bell size={20} />}
          label="Unread Notifs"
          value={unreadNotifs}
          color="yellow"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassCard glowColor="cyan" className="p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wider text-primary">
            Quick Actions
          </h3>
          <div className="flex gap-3 flex-wrap">
            <NeonButton
              variant="primary"
              onClick={() => onNavigate("attendance")}
              data-ocid="quick-mark-attendance"
            >
              <CheckSquare size={16} />
              Mark Today's Attendance
            </NeonButton>
            <NeonButton
              variant="secondary"
              onClick={() => onNavigate("grades")}
              data-ocid="quick-upload-grades"
            >
              <Star size={16} />
              Upload Grades
            </NeonButton>
            <NeonButton
              variant="danger"
              onClick={() => onNavigate("outing")}
              data-ocid="quick-view-requests"
            >
              <MapPin size={16} />
              View Pending Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-accent/20 text-xs">
                  {pendingRequests.length}
                </span>
              )}
            </NeonButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Recent students preview */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <GlassCard glowColor="yellow" className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Users size={16} className="text-secondary" />
              Assigned Students
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("students")}
              className="text-xs text-primary font-mono hover:text-primary/80 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(students.length > 0
              ? students.slice(0, 4)
              : MOCK_STUDENTS.slice(0, 4)
            ).map((s, i) => (
              <div
                key={s.id ?? i}
                className="flex items-center gap-3 p-2.5 rounded-lg glass-effect-darker border border-border/20"
              >
                <div className="w-8 h-8 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-sm font-display font-bold text-secondary flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {s.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

const MOCK_STUDENTS: UserProfile[] = [
  {
    id: "m1",
    name: "Arjun Sharma",
    email: "arjun@edu.ac.in",
    role: "student" as never,
    createdAt: BigInt(0),
  },
  {
    id: "m2",
    name: "Priya Patel",
    email: "priya@edu.ac.in",
    role: "student" as never,
    createdAt: BigInt(0),
  },
  {
    id: "m3",
    name: "Rahul Kumar",
    email: "rahul@edu.ac.in",
    role: "student" as never,
    createdAt: BigInt(0),
  },
  {
    id: "m4",
    name: "Sneha Iyer",
    email: "sneha@edu.ac.in",
    role: "student" as never,
    createdAt: BigInt(0),
  },
];
