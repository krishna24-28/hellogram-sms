/// Domain-specific type definitions for the Hologram Student Management System.
/// All types are shared (serializable) for use in public canister APIs.
import Common "common";

module {

  // Re-export common types for convenience
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;
  public type UserRole = Common.UserRole;
  public type ApprovalStatus = Common.ApprovalStatus;
  public type AttendanceStatus = Common.AttendanceStatus;

  // ─────────────────────────────────────────────
  // USER TYPES
  // ─────────────────────────────────────────────

  /// Core user profile stored for every registered user
  public type UserProfile = {
    id        : UserId;
    name      : Text;
    email     : Text;
    role      : UserRole;
    createdAt : Timestamp;
  };

  /// Extended profile for students
  public type StudentProfile = {
    userId       : UserId;
    faculty      : Text;
    year         : Nat;
    enrollmentId : Text;
  };

  /// Extended profile for teachers
  public type TeacherProfile = {
    userId          : UserId;
    subject         : Text;
    assignedStudents : [UserId];
  };

  // ─────────────────────────────────────────────
  // ACADEMIC TYPES
  // ─────────────────────────────────────────────

  /// A single entry in a class timetable
  public type TimetableEntry = {
    day     : Text;
    subject : Text;
    time    : Text;
    room    : Text;
    teacher : Text;
  };

  /// Attendance record for a student in a subject on a given date
  public type AttendanceRecord = {
    studentId : UserId;
    date      : Text;
    subject   : Text;
    status    : AttendanceStatus;
  };

  /// Grade awarded to a student for a subject in a semester
  public type Grade = {
    studentId : UserId;
    subject   : Text;
    marks     : Float;
    grade     : Text;
    semester  : Text;
  };

  /// Syllabus document uploaded by a teacher
  public type Syllabus = {
    id         : Text;
    subject    : Text;
    title      : Text;
    fileUrl    : Text;
    uploadedBy : UserId;
    uploadedAt : Timestamp;
  };

  // ─────────────────────────────────────────────
  // OUTING TYPES
  // ─────────────────────────────────────────────

  /// A student's request to leave campus, pending admin approval
  public type OutingRequest = {
    id            : Text;
    studentId     : UserId;
    destination   : Text;
    reason        : Text;
    startDate     : Text;
    endDate       : Text;
    status        : ApprovalStatus;
    reviewedBy    : ?UserId;
    reviewComment : ?Text;
    createdAt     : Timestamp;
  };

  /// Combined student info returned by getAllStudents (profile + extended profile)
  public type StudentInfo = {
    profile        : UserProfile;
    studentProfile : ?StudentProfile;
  };

  /// Combined teacher info returned by getAllTeachers (profile + extended profile)
  public type TeacherInfo = {
    profile        : UserProfile;
    teacherProfile : ?TeacherProfile;
  };

  // ─────────────────────────────────────────────
  // NOTIFICATION TYPES
  // ─────────────────────────────────────────────

  /// In-app notification sent to a user
  public type Notification = {
    id        : Text;
    userId    : UserId;
    message   : Text;
    notifType : Text;   // renamed from `type` (reserved keyword)
    read      : Bool;
    createdAt : Timestamp;
  };

  // ─────────────────────────────────────────────
  // QUIZ / ASSIGNMENT TYPES
  // ─────────────────────────────────────────────

  /// Result of a quiz taken by a student
  public type QuizResult = {
    id        : Text;
    studentId : UserId;
    subject   : Text;
    quizName  : Text;
    score     : Float;
    maxScore  : Float;
    date      : Text;
  };

  /// An assignment created by a teacher and assigned to students
  public type Assignment = {
    id          : Text;
    title       : Text;
    subject     : Text;
    description : Text;
    fileUrl     : Text;
    dueDate     : Text;
    teacherId   : UserId;
    assignedTo  : [UserId];
    createdAt   : Timestamp;
  };

  // ─────────────────────────────────────────────
  // DOCUMENT TYPES
  // ─────────────────────────────────────────────

  /// Category of a document upload
  public type DocumentCategory = {
    #assignment;
    #syllabus;
    #notes;
    #other;
  };

  /// Metadata for an uploaded document (content stored separately by docId)
  public type DocumentMeta = {
    id         : Text;
    uploadedBy : UserId;
    fileName   : Text;
    category   : DocumentCategory;
    uploadedAt : Timestamp;
    /// Optional assignment id if this doc is attached to an assignment
    assignmentId : ?Text;
  };

};
