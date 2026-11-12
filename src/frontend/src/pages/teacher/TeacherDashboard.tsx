import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import {
  useGetAssignedStudents,
  useGetAssignmentsBySubject,
  useGetPendingOutingRequests,
  useGetTeacherProfile,
  useGetUserNotifications,
} from "../../hooks/useQueries";
import { useAuthStore } from "../../store/authStore";
import { TeacherAnalytics } from "./sections/TeacherAnalytics";
import { TeacherAssignments } from "./sections/TeacherAssignments";
import { TeacherAttendance } from "./sections/TeacherAttendance";
import { TeacherGrades } from "./sections/TeacherGrades";
import { TeacherOutingRequests } from "./sections/TeacherOutingRequests";
import { TeacherOverview } from "./sections/TeacherOverview";
import { TeacherStudents } from "./sections/TeacherStudents";

type Section =
  | "overview"
  | "students"
  | "attendance"
  | "grades"
  | "assignments"
  | "outing"
  | "analytics";

const sectionLabels: Record<Section, string> = {
  overview: "Overview",
  students: "Students",
  attendance: "Attendance",
  grades: "Grades & Marks",
  assignments: "Assignments",
  outing: "Outing Requests",
  analytics: "Analytics",
};

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const { data: profile, isLoading: profileLoading } =
    useGetTeacherProfile(userId);
  const { data: students = [] } = useGetAssignedStudents(userId);
  const { data: pendingRequests = [] } = useGetPendingOutingRequests(userId);
  const { data: notifications = [] } = useGetUserNotifications(userId);
  const { data: assignments = [] } = useGetAssignmentsBySubject(
    profile?.subject,
  );

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  if (profileLoading) {
    return (
      <DashboardLayout
        title="Teacher Dashboard"
        activeSection={activeSection}
        onNavSelect={(s) => setActiveSection(s as Section)}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" label="LOADING PORTAL" />
        </div>
      </DashboardLayout>
    );
  }

  const sectionNav: { key: Section; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "students", label: "Students", badge: students.length },
    { key: "attendance", label: "Attendance" },
    { key: "grades", label: "Grades" },
    { key: "assignments", label: "Assignments", badge: assignments.length },
    {
      key: "outing",
      label: "Outing Requests",
      badge: pendingRequests.length > 0 ? pendingRequests.length : undefined,
    },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <DashboardLayout
      title={`Teacher — ${sectionLabels[activeSection]}`}
      activeSection={activeSection}
      onNavSelect={(s) => setActiveSection(s as Section)}
    >
      <div className="space-y-5 max-w-7xl">
        {/* Section nav tabs */}
        <div
          className="flex gap-1.5 flex-wrap"
          role="tablist"
          data-ocid="teacher-section-nav"
        >
          {sectionNav.map(({ key, label, badge }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeSection === key}
              onClick={() => setActiveSection(key)}
              data-ocid={`tab-${key}`}
              className={[
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200",
                activeSection === key
                  ? "bg-primary/15 text-primary border border-primary/40 shadow-glow-cyan"
                  : "text-muted-foreground border border-border/30 hover:text-primary/70 hover:border-primary/30 hover:bg-primary/5",
              ].join(" ")}
            >
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-0.5 px-1 py-0.5 rounded text-[10px] bg-accent/20 text-accent border border-accent/30">
                  {badge}
                </span>
              )}
              {activeSection === key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full shadow-glow-cyan"
                />
              )}
            </button>
          ))}
        </div>

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeSection === "overview" && (
              <TeacherOverview
                user={user}
                profile={profile ?? null}
                students={students}
                pendingRequests={pendingRequests}
                assignments={assignments}
                unreadNotifs={unreadNotifs}
                onNavigate={setActiveSection}
              />
            )}
            {activeSection === "students" && (
              <TeacherStudents students={students} />
            )}
            {activeSection === "attendance" && (
              <TeacherAttendance
                students={students}
                userId={userId}
                subject={profile?.subject ?? ""}
              />
            )}
            {activeSection === "grades" && (
              <TeacherGrades
                students={students}
                subject={profile?.subject ?? ""}
              />
            )}
            {activeSection === "assignments" && (
              <TeacherAssignments
                students={students}
                subject={profile?.subject ?? ""}
                teacherId={userId ?? ""}
              />
            )}
            {activeSection === "outing" && (
              <TeacherOutingRequests teacherId={userId} />
            )}
            {activeSection === "analytics" && (
              <TeacherAnalytics students={students} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
