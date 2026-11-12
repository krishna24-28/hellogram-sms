import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DocumentMeta {
    id: string;
    fileName: string;
    assignmentId?: string;
    category: DocumentCategory;
    uploadedAt: Timestamp;
    uploadedBy: UserId;
}
export interface TimetableEntry {
    day: string;
    subject: string;
    room: string;
    time: string;
    teacher: string;
}
export interface QuizResult {
    id: string;
    studentId: UserId;
    maxScore: number;
    subject: string;
    date: string;
    score: number;
    quizName: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface TeacherProfile {
    subject: string;
    userId: UserId;
    assignedStudents: Array<UserId>;
}
export type UserId = string;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface StudentProfile {
    enrollmentId: string;
    userId: UserId;
    year: bigint;
    faculty: string;
}
export interface Grade {
    marks: number;
    studentId: UserId;
    semester: string;
    subject: string;
    grade: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface StudentInfo {
    studentProfile?: StudentProfile;
    profile: UserProfile;
}
export interface Notification {
    id: string;
    notifType: string;
    userId: UserId;
    createdAt: Timestamp;
    read: boolean;
    message: string;
}
export interface OutingRequest {
    id: string;
    status: ApprovalStatus;
    destination: string;
    studentId: UserId;
    endDate: string;
    createdAt: Timestamp;
    reviewComment?: string;
    reviewedBy?: UserId;
    startDate: string;
    reason: string;
}
export interface ChatMessage {
    content: string;
    role: string;
}
export interface AttendanceRecord {
    status: AttendanceStatus;
    studentId: UserId;
    subject: string;
    date: string;
}
export interface Assignment {
    id: string;
    title: string;
    assignedTo: Array<UserId>;
    subject: string;
    createdAt: Timestamp;
    dueDate: string;
    description: string;
    teacherId: UserId;
    fileUrl: string;
}
export interface TeacherInfo {
    teacherProfile?: TeacherProfile;
    profile: UserProfile;
}
export interface UserProfile {
    id: UserId;
    name: string;
    createdAt: Timestamp;
    role: UserRole;
    email: string;
}
export enum ApprovalStatus {
    pending = "pending",
    denied = "denied",
    approved = "approved"
}
export enum AttendanceStatus {
    present = "present",
    late = "late",
    absent = "absent"
}
export enum DocumentCategory {
    assignment = "assignment",
    other = "other",
    notes = "notes",
    syllabus = "syllabus"
}
export enum UserRole {
    admin = "admin",
    teacher = "teacher",
    student = "student"
}
export enum Variant_ok {
    ok = "ok"
}
/**
 * / Hologram Student Management System — main actor.
 * / Composes the AI chatbot mixin, users-academic domain mixins,
 * / document uploads mixin, and the object-storage platform extension.
 */
export interface backendInterface {
    addGrade(grade: Grade, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addNotification(notification: Notification, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addQuizResult(quiz: QuizResult, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignStudentToTeacher(teacherId: UserId, studentId: UserId, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createAssignment(assignment: Assignment, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: Assignment;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createStudentProfile(userId: UserId, faculty: string, year: bigint, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: StudentProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createTeacherProfile(userId: UserId, subject: string, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: TeacherProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteDocument(docId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    forceReseedAdmin(): Promise<Variant_ok>;
    generateStudyRoadmap(goal: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllDocuments(): Promise<Array<DocumentMeta>>;
    getAllOutingRequests(): Promise<Array<OutingRequest>>;
    getAllStudents(callerUserId: string): Promise<Array<StudentInfo>>;
    getAllTeachers(callerUserId: string): Promise<Array<TeacherInfo>>;
    getAssignedStudents(teacherId: UserId): Promise<Array<UserProfile>>;
    getAssignmentDocuments(assignmentId: string): Promise<Array<DocumentMeta>>;
    getAssignmentsBySubject(subject: string): Promise<Array<Assignment>>;
    getAttendanceByDate(date: string, teacherId: UserId): Promise<Array<AttendanceRecord>>;
    getDocumentContent(docId: string): Promise<Uint8Array | null>;
    getDocumentMeta(docId: string): Promise<DocumentMeta | null>;
    getPendingOutingRequests(teacherId: UserId): Promise<Array<OutingRequest>>;
    getStudentAssignments(studentId: UserId): Promise<Array<Assignment>>;
    getStudentAttendance(studentId: UserId): Promise<Array<AttendanceRecord>>;
    getStudentGrades(studentId: UserId): Promise<Array<Grade>>;
    getStudentOutingRequests(studentId: UserId): Promise<Array<OutingRequest>>;
    getStudentProfile(userId: UserId): Promise<StudentProfile | null>;
    getStudentQuizResults(studentId: UserId): Promise<Array<QuizResult>>;
    getTeacherProfile(userId: UserId): Promise<TeacherProfile | null>;
    getTimetable(faculty: string): Promise<Array<TimetableEntry>>;
    getUserDocuments(userId: UserId): Promise<Array<DocumentMeta>>;
    getUserNotifications(userId: UserId): Promise<Array<Notification>>;
    getUserProfile(userId: UserId): Promise<UserProfile | null>;
    loginWithPassword(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markAttendance(records: Array<AttendanceRecord>, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markNotificationRead(notifId: string, userId: UserId, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerUser(name: string, email: string, role: UserRole): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerWithPassword(username: string, password: string, name: string, email: string, role: UserRole): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    removeUser(userId: UserId, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    reviewOutingRequest(requestId: string, status: ApprovalStatus, comment: string | null, reviewerId: UserId): Promise<{
        __kind__: "ok";
        ok: OutingRequest;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendChatMessage(messages: Array<ChatMessage>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitOutingRequest(req: {
        destination: string;
        studentId: UserId;
        endDate: string;
        startDate: string;
        reason: string;
    }): Promise<{
        __kind__: "ok";
        ok: OutingRequest;
    } | {
        __kind__: "err";
        err: string;
    }>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateStudentFaculty(userId: UserId, faculty: string, callerUserId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    uploadDocument(fileName: string, fileData: Uint8Array, category: DocumentCategory, assignmentId: string | null): Promise<{
        __kind__: "ok";
        ok: DocumentMeta;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
