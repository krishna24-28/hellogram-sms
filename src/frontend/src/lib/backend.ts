import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";
import type {
  UserProfile,
  StudentProfile,
  TeacherProfile,
  AttendanceRecord,
  Grade,
  OutingRequest,
  Notification,
  QuizResult,
  Assignment,
  TimetableEntry,
  ChatMessage,
} from "../types";
import { UserRole, ApprovalStatus } from "../types";

export function useBackendActor() {
  return useActor(createActor);
}

// Helper to unwrap Result types from the backend
export function unwrapResult<T>(
  res: { __kind__: "ok"; ok: T } | { __kind__: "err"; err: string },
): T {
  if (res.__kind__ === "err") throw new Error(res.err);
  return res.ok;
}

export type {
  UserProfile,
  StudentProfile,
  TeacherProfile,
  AttendanceRecord,
  Grade,
  OutingRequest,
  Notification,
  QuizResult,
  Assignment,
  TimetableEntry,
  ChatMessage,
};
export { UserRole, ApprovalStatus };
