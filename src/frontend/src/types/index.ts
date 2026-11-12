// Re-export enums as values (needed for runtime comparisons)
export { UserRole, ApprovalStatus, AttendanceStatus } from "../backend.d";

// Re-export types
export type {
  UserProfile,
  StudentProfile,
  TeacherProfile,
  StudentInfo,
  TeacherInfo,
  TimetableEntry,
  AttendanceRecord,
  Grade,
  OutingRequest,
  Notification,
  QuizResult,
  Assignment,
  ChatMessage,
} from "../backend.d";

export type AppChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type NavItem = {
  label: string;
  icon: string;
  path: string;
};
