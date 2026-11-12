import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unwrapResult, useBackendActor } from "../lib/backend";
import { useAuthStore } from "../store/authStore";
import type {
  ApprovalStatus,
  Assignment,
  AttendanceRecord,
  ChatMessage,
  Grade,
  Notification,
  OutingRequest,
  QuizResult,
  UserRole,
} from "../types";

function useActor() {
  return useBackendActor();
}

/** Returns the current user's userId for password-auth callers, or empty string for II users. */
function useCallerUserId(): string {
  const user = useAuthStore((s) => s.user);
  return user?.id ?? "";
}

// ── User ──────────────────────────────────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      role,
    }: { name: string; email: string; role: UserRole }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.registerUser(name, email, role));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useGetUserProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();
  const callerUserId = useCallerUserId();
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents(callerUserId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useGetAllTeachers() {
  const { actor, isFetching } = useActor();
  const callerUserId = useCallerUserId();
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeachers(callerUserId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useRemoveUser() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.removeUser(userId, callerUserId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

// ── Actor readiness helper ────────────────────────────────────────────────────

/** Polls for actor readiness. Resolves with the actor or throws after timeout. */
async function waitForActor(
  getActor: () => {
    actor: ReturnType<typeof useActor>["actor"];
    isFetching: boolean;
  },
  timeoutMs = 10000,
  intervalMs = 500,
): Promise<NonNullable<ReturnType<typeof useActor>["actor"]>> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { actor, isFetching } = getActor();
    if (actor && !isFetching) return actor;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("SYSTEM_NOT_READY");
}

/**
 * Returns whether the backend actor is currently ready.
 * Used by LoginPage to show system status.
 */
export function useActorReady() {
  const { actor, isFetching } = useActor();
  return { ready: !!actor && !isFetching, initializing: isFetching || !actor };
}

// ── Password Auth ─────────────────────────────────────────────────────────────

export function useLoginWithPassword() {
  // Keep a stable ref to actor state so the poll closure can read it
  const actorState = useActor();
  const actorRef = { current: actorState };
  // Update ref on each render so the closure always reads fresh values
  actorRef.current = actorState;

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      // Poll for actor readiness for up to 10 seconds
      const actor = await waitForActor(() => actorRef.current, 10000, 500);
      const result = await actor.loginWithPassword(username, password);
      if (result.__kind__ === "err") {
        // Propagate the exact error string so callers can detect INVALID_CREDENTIALS
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}

export function useRegisterWithPassword() {
  const actorState = useActor();
  const actorRef = { current: actorState };
  actorRef.current = actorState;

  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      name,
      email,
      role,
    }: {
      username: string;
      password: string;
      name: string;
      email: string;
      role: UserRole;
    }) => {
      const actor = await waitForActor(() => actorRef.current, 10000, 500);
      return unwrapResult(
        await actor.registerWithPassword(username, password, name, email, role),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

// ── Student Profile ───────────────────────────────────────────────────────────

export function useCreateStudentProfile() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      faculty,
      year,
    }: {
      userId: string;
      faculty: string;
      year: number;
      enrollmentId?: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.createStudentProfile(
          userId,
          faculty,
          BigInt(year),
          callerUserId,
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useGetStudentProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getStudentProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useUpdateStudentFaculty() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      faculty,
    }: { userId: string; faculty: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.updateStudentFaculty(userId, faculty, callerUserId),
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["studentProfile", vars.userId] }),
  });
}

export function useGetTimetable(faculty: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["timetable", faculty],
    queryFn: async () => {
      if (!actor || !faculty) return [];
      return actor.getTimetable(faculty);
    },
    enabled: !!actor && !isFetching && !!faculty,
  });
}

// ── Teacher Profile ───────────────────────────────────────────────────────────

export function useCreateTeacherProfile() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      subject,
    }: { userId: string; subject: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.createTeacherProfile(userId, subject, callerUserId),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useGetTeacherProfile(userId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teacherProfile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getTeacherProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAssignStudentToTeacher() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teacherId,
      studentId,
    }: { teacherId: string; studentId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.assignStudentToTeacher(teacherId, studentId, callerUserId),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignedStudents"] }),
  });
}

export function useGetAssignedStudents(teacherId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assignedStudents", teacherId],
    queryFn: async () => {
      if (!actor || !teacherId) return [];
      return actor.getAssignedStudents(teacherId);
    },
    enabled: !!actor && !isFetching && !!teacherId,
  });
}

// ── Attendance ────────────────────────────────────────────────────────────────

export function useMarkAttendance() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: AttendanceRecord[]) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.markAttendance(records, callerUserId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useGetStudentAttendance(studentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendance", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentAttendance(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetAttendanceByDate(
  date: string,
  teacherId: string | undefined,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendanceByDate", date, teacherId],
    queryFn: async () => {
      if (!actor || !teacherId) return [];
      return actor.getAttendanceByDate(date, teacherId);
    },
    enabled: !!actor && !isFetching && !!teacherId && !!date,
  });
}

// ── Grades ────────────────────────────────────────────────────────────────────

export function useAddGrade() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (grade: Grade) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.addGrade(grade, callerUserId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

export function useGetStudentGrades(studentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["grades", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentGrades(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export function useAddQuizResult() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quiz: QuizResult) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.addQuizResult(quiz, callerUserId));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quizResults"] }),
  });
}

export function useGetStudentQuizResults(studentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["quizResults", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentQuizResults(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

// ── Outing Requests ───────────────────────────────────────────────────────────

export function useSubmitOutingRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: {
      studentId: string;
      destination: string;
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.submitOutingRequest(req));
    },
    onSuccess: (_data, vars) => {
      // Invalidate all outing-related queries so every view refreshes
      qc.invalidateQueries({ queryKey: ["outingRequests", vars.studentId] });
      qc.invalidateQueries({ queryKey: ["outingRequests"] });
      qc.invalidateQueries({ queryKey: ["allOutingRequests"] });
      qc.invalidateQueries({ queryKey: ["pendingOutingRequests"] });
    },
  });
}

export function useGetStudentOutingRequests(studentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["outingRequests", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [] as OutingRequest[];
      return actor.getStudentOutingRequests(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useGetPendingOutingRequests(teacherId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingOutingRequests", teacherId],
    queryFn: async () => {
      if (!actor || !teacherId) return [] as OutingRequest[];
      return actor.getPendingOutingRequests(teacherId);
    },
    enabled: !!actor && !isFetching && !!teacherId,
  });
}

export function useGetAllOutingRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allOutingRequests"],
    queryFn: async () => {
      if (!actor) return [] as OutingRequest[];
      try {
        return await actor.getAllOutingRequests();
      } catch {
        // If backend rejects (e.g. auth error), return empty array gracefully
        return [] as OutingRequest[];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useReviewOutingRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      comment,
      reviewerId,
    }: {
      requestId: string;
      status: ApprovalStatus;
      comment: string | null;
      reviewerId: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.reviewOutingRequest(requestId, status, comment, reviewerId),
      );
    },
    onSuccess: () => {
      // Invalidate all outing-related queries so all views refresh immediately
      qc.invalidateQueries({ queryKey: ["pendingOutingRequests"] });
      qc.invalidateQueries({ queryKey: ["allOutingRequests"] });
      // Also invalidate student-specific queries (the approved student's list should update)
      qc.invalidateQueries({ queryKey: ["outingRequests"] });
    },
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function useAddNotification() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notification: Notification) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.addNotification(notification, callerUserId),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useGetUserNotifications(userId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserNotifications(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      notifId,
      userId,
    }: { notifId: string; userId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.markNotificationRead(notifId, userId, callerUserId),
      );
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["notifications", vars.userId] }),
  });
}

// ── Assignments ───────────────────────────────────────────────────────────────

export function useCreateAssignment() {
  const { actor } = useActor();
  const callerUserId = useCallerUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: Assignment) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(
        await actor.createAssignment(assignment, callerUserId),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

export function useGetAssignmentsBySubject(subject: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["assignments", subject],
    queryFn: async () => {
      if (!actor || !subject) return [];
      return actor.getAssignmentsBySubject(subject);
    },
    enabled: !!actor && !isFetching && !!subject,
  });
}

export function useGetStudentAssignments(studentId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["studentAssignments", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getStudentAssignments(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

// ── Chat / AI ─────────────────────────────────────────────────────────────────

export function useSendChatMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      message,
      history,
    }: {
      userId?: string;
      message: string;
      history: Array<{ role: string; content: string }>;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // Build the full messages array: history + new user message
      const messages: ChatMessage[] = [
        ...history,
        { role: "user", content: message },
      ];
      return unwrapResult(await actor.sendChatMessage(messages));
    },
  });
}

export function useGenerateStudyRoadmap() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (goal: string) => {
      if (!actor) throw new Error("Actor not ready");
      return unwrapResult(await actor.generateStudyRoadmap(goal));
    },
  });
}
