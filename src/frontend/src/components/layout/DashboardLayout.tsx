import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useRouter } from "@tanstack/react-router";
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";
import { HUDCircle } from "../ui/HUDCircle";
import { HologramBackground } from "../ui/HologramBackground";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  section: string;
}

const studentNav: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    section: "overview",
  },
  { label: "My Grades", icon: <Award size={18} />, section: "grades" },
  {
    label: "Attendance",
    icon: <ClipboardList size={18} />,
    section: "attendance",
  },
  { label: "Timetable", icon: <Calendar size={18} />, section: "timetable" },
  { label: "Assignments", icon: <BookOpen size={18} />, section: "syllabus" },
  { label: "Outing Requests", icon: <MapPin size={18} />, section: "outing" },
  { label: "AI Assistant", icon: <MessageSquare size={18} />, section: "ai" },
  {
    label: "Notifications",
    icon: <Bell size={18} />,
    section: "notifications",
  },
];

const teacherNav: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    section: "overview",
  },
  { label: "My Students", icon: <Users size={18} />, section: "students" },
  {
    label: "Attendance",
    icon: <ClipboardList size={18} />,
    section: "attendance",
  },
  {
    label: "Assignments",
    icon: <BookOpen size={18} />,
    section: "assignments",
  },
  { label: "Grades", icon: <Award size={18} />, section: "grades" },
  { label: "Outing Requests", icon: <MapPin size={18} />, section: "outing" },
  {
    label: "Notifications",
    icon: <Bell size={18} />,
    section: "notifications",
  },
];

const adminNav: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    section: "overview",
  },
  {
    label: "All Students",
    icon: <GraduationCap size={18} />,
    section: "students",
  },
  { label: "All Teachers", icon: <UserCheck size={18} />, section: "teachers" },
  { label: "Outing Requests", icon: <MapPin size={18} />, section: "outing" },
  {
    label: "Assignments",
    icon: <BookMarked size={18} />,
    section: "assignments",
  },
  {
    label: "Notifications",
    icon: <Bell size={18} />,
    section: "notifications",
  },
  { label: "Settings", icon: <Settings size={18} />, section: "settings" },
];

function navByRole(role: UserRole | null): NavItem[] {
  if (role === UserRole.student) return studentNav;
  if (role === UserRole.teacher) return teacherNav;
  if (role === UserRole.admin) return adminNav;
  return [];
}

const roleLabel: Record<UserRole, string> = {
  [UserRole.student]: "STUDENT",
  [UserRole.teacher]: "TEACHER",
  [UserRole.admin]: "ADMIN",
};

const roleColor: Record<UserRole, string> = {
  [UserRole.student]: "text-primary",
  [UserRole.teacher]: "text-secondary",
  [UserRole.admin]: "text-accent",
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  activeSection?: string;
  onNavSelect?: (section: string) => void;
}

export function DashboardLayout({
  children,
  title,
  activeSection,
  onNavSelect,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, logout } = useAuthStore();
  const { clear } = useInternetIdentity();
  const router = useRouter();
  const navItems = navByRole(role);

  const handleLogout = () => {
    logout();
    clear();
    router.navigate({ to: "/" });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <HUDCircle size={40} color="cyan" speed="slow" innerRing>
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
          </HUDCircle>
          <div>
            <h1 className="font-display text-sm font-bold text-primary tracking-widest uppercase">
              HOLOGRAM
            </h1>
            <p className="text-xs text-muted-foreground font-mono tracking-wider">
              Student OS
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 p-3 space-y-1 overflow-y-auto"
        data-ocid="sidebar-nav"
      >
        {navItems.map((item) => {
          const isActive = activeSection
            ? activeSection === item.section
            : item.section === "overview";
          return (
            <button
              key={item.section}
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                onNavSelect?.(item.section);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                "text-sm font-body text-left",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
              data-ocid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary/70",
                )}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow-cyan"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-border/20">
        <div className="glass-effect-darker rounded-lg p-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-display font-bold",
                role ? "border-primary/40 text-primary bg-primary/10" : "",
              )}
            >
              {user?.name.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.name ?? "Unknown"}
              </p>
              {role && (
                <p className={cn("text-xs font-mono", roleColor[role])}>
                  {roleLabel[role]}
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="logout-btn"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-200 group"
        >
          <LogOut
            size={16}
            className="group-hover:text-accent transition-colors"
          />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex relative">
      <HologramBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 relative z-10">
        <div className="fixed w-60 h-screen glass-effect-darker border-r border-border/20">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20 lg:hidden"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen w-60 z-30 lg:hidden glass-effect border-r border-border/20"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-14 flex items-center px-4 gap-4 glass-effect-darker border-b border-border/20">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            aria-label="Open sidebar"
            data-ocid="sidebar-toggle"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-primary/40 font-mono text-xs hidden sm:block">
              /
            </span>
            {title && (
              <h2 className="text-sm font-display font-semibold text-foreground truncate">
                {title}
              </h2>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md glass-effect-darker border border-border/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-xs font-mono text-primary/70">ONLINE</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 p-4 md:p-6 overflow-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
