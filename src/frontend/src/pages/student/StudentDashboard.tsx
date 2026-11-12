import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  useGetStudentAssignments,
  useGetStudentAttendance,
  useGetStudentGrades,
  useGetStudentOutingRequests,
  useGetStudentProfile,
  useGetTimetable,
  useGetUserNotifications,
  useUpdateStudentFaculty,
} from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";
import {
  Award,
  BookOpen,
  Bot,
  Calendar,
  ClipboardList,
  DoorOpen,
  FolderOpen,
  LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AIAssistantSection } from "./sections/AIAssistantSection";
import { AttendanceSection } from "./sections/AttendanceSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { GradesSection } from "./sections/GradesSection";
import { OutingSection } from "./sections/OutingSection";
import { OverviewSection } from "./sections/OverviewSection";
import { SyllabusSection } from "./sections/SyllabusSection";
import { TimetableSection } from "./sections/TimetableSection";

type SectionId =
  | "overview"
  | "timetable"
  | "attendance"
  | "grades"
  | "syllabus"
  | "outing"
  | "documents"
  | "ai";

interface NavTab {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const NAV_TABS: NavTab[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "timetable", label: "Timetable", icon: <Calendar size={16} /> },
  { id: "attendance", label: "Attendance", icon: <ClipboardList size={16} /> },
  { id: "grades", label: "Grades", icon: <Award size={16} /> },
  { id: "syllabus", label: "Syllabus", icon: <BookOpen size={16} /> },
  { id: "outing", label: "Outing", icon: <DoorOpen size={16} /> },
  { id: "documents", label: "Documents", icon: <FolderOpen size={16} /> },
  { id: "ai", label: "AI Assistant", icon: <Bot size={16} /> },
];

export function StudentDashboard() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const [activeSection, setActiveSection] = useState<SectionId>("overview");

  // All queries fire in parallel — no cascading enabled guards
  const { data: profile, isLoading: profileLoading } =
    useGetStudentProfile(userId);
  const { data: grades = [], isLoading: gradesLoading } =
    useGetStudentGrades(userId);
  const { data: attendance = [], isLoading: attendanceLoading } =
    useGetStudentAttendance(userId);
  const { data: assignments = [] } = useGetStudentAssignments(userId);
  const { data: outingRequests = [] } = useGetStudentOutingRequests(userId);
  const { data: notifications = [] } = useGetUserNotifications(userId);
  // Timetable depends on faculty — uses profile once loaded, not blocking others
  const { data: timetable = [] } = useGetTimetable(profile?.faculty);

  const updateFaculty = useUpdateStudentFaculty();

  const handleUpdateFaculty = async (faculty: string) => {
    if (!userId) return;
    try {
      await updateFaculty.mutateAsync({ userId, faculty });
      toast.success("Faculty updated successfully!");
    } catch {
      toast.error("Failed to update faculty.");
    }
  };

  if (profileLoading) {
    return (
      <DashboardLayout
        title="Student Dashboard"
        activeSection={activeSection}
        onNavSelect={(s) => setActiveSection(s as SectionId)}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" label="LOADING PORTAL" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Student Dashboard"
      activeSection={activeSection}
      onNavSelect={(s) => setActiveSection(s as SectionId)}
    >
      <div className="max-w-7xl space-y-5">
        {/* Section Navigation Tabs */}
        <div className="overflow-x-auto">
          <div
            className="flex gap-1.5 p-1.5 glass-effect-darker rounded-xl border border-border/20 w-max min-w-full"
            data-ocid="section-nav"
          >
            {NAV_TABS.map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-ocid={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-display font-semibold transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/40 shadow-glow-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <span className={isActive ? "text-primary" : ""}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {tab.id === "ai" && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {activeSection === "overview" && (
              <OverviewSection
                userName={user?.name ?? "Student"}
                profile={profile}
                grades={grades}
                attendance={attendance}
                assignments={assignments}
                outingRequests={outingRequests}
                notifications={notifications}
                onUpdateFaculty={handleUpdateFaculty}
                isUpdatingFaculty={updateFaculty.isPending}
              />
            )}
            {activeSection === "timetable" && (
              <TimetableSection
                timetable={timetable}
                faculty={profile?.faculty}
              />
            )}
            {activeSection === "attendance" && (
              <AttendanceSection
                attendance={attendance}
                isLoading={attendanceLoading}
              />
            )}
            {activeSection === "grades" && (
              <GradesSection grades={grades} isLoading={gradesLoading} />
            )}
            {activeSection === "syllabus" && <SyllabusSection />}
            {activeSection === "outing" && <OutingSection />}
            {activeSection === "documents" && (
              <DocumentsSection userId={userId ?? ""} />
            )}
            {activeSection === "ai" && <AIAssistantSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
