/// Public API mixin for the Hologram Student Management System.
/// Handles users, student/teacher profiles, attendance, grades, quizzes,
/// outing requests, notifications, and assignments.
/// Also supports username/password login alongside Internet Identity.
import Map     "mo:core/Map";
import List    "mo:core/List";
import Text    "mo:core/Text";
import Time    "mo:core/Time";
import Types   "../types/types";
import Common  "../types/common";
import Lib     "../lib/users-academic";

mixin (
  /// role map: userId (Text) -> UserRole
  roles                : Map.Map<Text, Common.UserRole>,
  /// core user profiles keyed by userId
  userProfiles         : Map.Map<Text, Types.UserProfile>,
  /// student extended profiles
  studentProfiles      : Map.Map<Text, Types.StudentProfile>,
  /// teacher extended profiles
  teacherProfiles      : Map.Map<Text, Types.TeacherProfile>,
  /// attendance records keyed by compound key "studentId|date|subject"
  attendance           : Map.Map<Text, Types.AttendanceRecord>,
  /// grades keyed by compound key "studentId|subject|semester"
  grades               : Map.Map<Text, Types.Grade>,
  /// quiz results keyed by quizResultId
  quizResults          : Map.Map<Text, Types.QuizResult>,
  /// outing requests keyed by request id
  outingRequests       : Map.Map<Text, Types.OutingRequest>,
  /// notifications keyed by notification id
  notifications        : Map.Map<Text, Types.Notification>,
  /// assignments keyed by assignment id
  assignments          : Map.Map<Text, Types.Assignment>,
  /// timetables keyed by faculty name
  timetables           : Map.Map<Text, [Types.TimetableEntry]>,
  /// monotonic counter for id generation
  idCounter            : List.List<Nat>,
  /// password credentials keyed by username (lowercase)
  passwordCredentials  : Map.Map<Text, Common.PasswordCredential>,
  /// flag: true after Krishna admin has been seeded (never reset)
  adminSeeded          : List.List<Bool>,
) {

  // ─────────────────────────────────────────────────────
  // FIRST-DEPLOY ADMIN SEEDING
  // ─────────────────────────────────────────────────────

  // Seed Krishna admin on very first initialization only.
  // `adminSeeded` is a singleton List<Bool>; if empty → not yet seeded.
  do {
    switch (adminSeeded.first()) {
      case (?true) {
        // Already seeded — verify the stored hash is correct.
        // If the credential is missing or has a bad hash, re-seed it.
        let expectedHash = Lib.hashPassword("krishna", "53083");
        switch (passwordCredentials.get("krishna")) {
          case null {
            // credential missing — re-add without changing seeded flag
            let krishnaId = "admin-krishna";
            let cred : Common.PasswordCredential = {
              userId       = krishnaId;
              username     = "krishna";
              passwordHash = expectedHash;
            };
            passwordCredentials.add("krishna", cred);
            userProfiles.add(krishnaId, {
              id        = krishnaId;
              name      = "Krishna";
              email     = "krishna@hellogram.edu";
              role      = #admin;
              createdAt = 0;
            });
            roles.add(krishnaId, #admin);
          };
          case (?cred) {
            if (cred.passwordHash != expectedHash) {
              // Hash format changed — update the stored hash
              passwordCredentials.add("krishna", { cred with passwordHash = expectedHash });
            };
          };
        };
      };
      case _ {
        let krishnaId = "admin-krishna";
        // Create user profile
        let adminProfile : Types.UserProfile = {
          id        = krishnaId;
          name      = "Krishna";
          email     = "krishna@hellogram.edu";
          role      = #admin;
          createdAt = 0;
        };
        userProfiles.add(krishnaId, adminProfile);
        roles.add(krishnaId, #admin);

        // Store hashed password credential
        let cred : Common.PasswordCredential = {
          userId       = krishnaId;
          username     = "krishna";
          passwordHash = Lib.hashPassword("krishna", "53083");
        };
        passwordCredentials.add("krishna", cred);

        // Mark as seeded
        if (adminSeeded.isEmpty()) {
          adminSeeded.add(true)
        } else {
          adminSeeded.mapInPlace(func _ = true)
        };
      };
    }
  };

  // ─────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────────────

  func nextId(prefix : Text) : Text {
    let cur = switch (idCounter.first()) { case (?n) n; case null 0 };
    idCounter.mapInPlace(func _ = cur + 1);
    if (idCounter.isEmpty()) { idCounter.add(cur + 1) };
    Lib.genId(prefix, cur + 1)
  };

  func callerId(caller : Principal) : Text {
    caller.toText()
  };

  /// The anonymous Principal text on the Internet Computer.
  /// Password-auth users always connect as this principal.
  let anonymousPrincipal : Text = "2vxsx-fae";

  /// Returns true if the caller is an admin (by principal) OR if the caller
  /// is the anonymous principal AND the provided passwordAuthUserId is an admin.
  /// This lets password-auth admins pass through admin-only gates by providing their userId.
  func isEffectiveAdmin(callerUid : Text, passwordAuthUserId : Text) : Bool {
    Lib.isAdmin(roles, callerUid) or
    (callerUid == anonymousPrincipal and Lib.isAdmin(roles, passwordAuthUserId))
  };

  /// Same as isEffectiveAdmin but also accepts teacher role.
  func isEffectiveAdminOrTeacher(callerUid : Text, passwordAuthUserId : Text) : Bool {
    Lib.isAdminOrTeacher(roles, callerUid) or
    (callerUid == anonymousPrincipal and Lib.isAdminOrTeacher(roles, passwordAuthUserId))
  };

  // ─────────────────────────────────────────────────────
  // 0. PASSWORD-BASED AUTH
  // ─────────────────────────────────────────────────────

  /// Force re-seed the Krishna admin account. Useful for recovery if
  /// the stored credential hash became stale. Anyone can call this
  /// (the credential/profile always resolves to a fixed admin).
  public shared func forceReseedAdmin() : async { #ok : () } {
    let krishnaId = "admin-krishna";
    let adminProfile : Types.UserProfile = {
      id        = krishnaId;
      name      = "Krishna";
      email     = "krishna@hellogram.edu";
      role      = #admin;
      createdAt = 0;
    };
    userProfiles.add(krishnaId, adminProfile);
    roles.add(krishnaId, #admin);
    let cred : Common.PasswordCredential = {
      userId       = krishnaId;
      username     = "krishna";
      passwordHash = Lib.hashPassword("krishna", "53083");
    };
    passwordCredentials.add("krishna", cred);
    if (adminSeeded.isEmpty()) {
      adminSeeded.add(true)
    } else {
      adminSeeded.mapInPlace(func _ = true)
    };
    #ok(())
  };

  /// Register a new user with username/password credentials.
  /// Returns the new userId on success.
  public shared func registerWithPassword(
    username : Text,
    password : Text,
    name     : Text,
    email    : Text,
    role     : Common.UserRole,
  ) : async { #ok : Text; #err : Text } {
    let uname = username.toLower();
    if (uname.size() < 3) return #err("Username must be at least 3 characters");
    if (password.size() < 4) return #err("Password must be at least 4 characters");

    switch (passwordCredentials.get(uname)) {
      case (?_) #err("Username already taken");
      case null {
        let uid = nextId("user");
        let profile : Types.UserProfile = {
          id        = uid;
          name      = name;
          email     = email;
          role      = role;
          createdAt = Time.now();
        };
        userProfiles.add(uid, profile);
        roles.add(uid, role);

        let cred : Common.PasswordCredential = {
          userId       = uid;
          username     = uname;
          passwordHash = Lib.hashPassword(uname, password);
        };
        passwordCredentials.add(uname, cred);
        #ok(uid)
      };
    }
  };

  /// Authenticate with username/password. Returns UserProfile on success.
  /// On invalid credentials, returns #err("INVALID_CREDENTIALS") so the
  /// frontend can redirect the user to the landing page.
  public shared func loginWithPassword(
    username : Text,
    password : Text,
  ) : async { #ok : Types.UserProfile; #err : Text } {
    let uname = username.toLower();
    switch (passwordCredentials.get(uname)) {
      case null #err("INVALID_CREDENTIALS");
      case (?cred) {
        if (not Lib.verifyPassword(uname, password, cred.passwordHash)) {
          return #err("INVALID_CREDENTIALS")
        };
        switch (userProfiles.get(cred.userId)) {
          case null #err("User profile not found");
          case (?profile) #ok(profile);
        }
      };
    }
  };

  // ─────────────────────────────────────────────────────
  // 1. USER MANAGEMENT
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(
    name  : Text,
    email : Text,
    role  : Common.UserRole,
  ) : async { #ok : Types.UserProfile; #err : Text } {
    let uid = callerId(caller);
    switch (userProfiles.get(uid)) {
      case (?_) #err("User already registered");
      case null {
        let profile : Types.UserProfile = {
          id        = uid;
          name      = name;
          email     = email;
          role      = role;
          createdAt = Time.now();
        };
        userProfiles.add(uid, profile);
        roles.add(uid, role);
        #ok(profile)
      };
    }
  };

  public query func getUserProfile(userId : Common.UserId) : async ?Types.UserProfile {
    userProfiles.get(userId)
  };

  public query ({ caller }) func getAllStudents(callerUserId : Text) : async [Types.StudentInfo] {
    let uid = callerId(caller);
    if (not isEffectiveAdmin(uid, callerUserId)) return [];
    let result = List.empty<Types.StudentInfo>();
    userProfiles.forEach(func(_, p) {
      if (p.role == #student) {
        let sp = studentProfiles.get(p.id);
        result.add({ profile = p; studentProfile = sp })
      }
    });
    result.toArray()
  };

  public query ({ caller }) func getAllTeachers(callerUserId : Text) : async [Types.TeacherInfo] {
    let uid = callerId(caller);
    if (not isEffectiveAdmin(uid, callerUserId)) return [];
    let result = List.empty<Types.TeacherInfo>();
    userProfiles.forEach(func(_, p) {
      if (p.role == #teacher) {
        let tp = teacherProfiles.get(p.id);
        result.add({ profile = p; teacherProfile = tp })
      }
    });
    result.toArray()
  };

  public shared ({ caller }) func removeUser(userId : Common.UserId, callerUserId : Text) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdmin(uid, callerUserId)) return #err("Unauthorized: admin only");
    switch (userProfiles.get(userId)) {
      case null #err("User not found");
      case (?_) {
        userProfiles.remove(userId);
        roles.remove(userId);
        #ok(())
      };
    }
  };

  // ─────────────────────────────────────────────────────
  // 2. STUDENT PROFILE
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func createStudentProfile(
    userId       : Common.UserId,
    faculty      : Text,
    year         : Nat,
    callerUserId : Text,
  ) : async { #ok : Types.StudentProfile; #err : Text } {
    let uid = callerId(caller);
    // Allow if: caller IS the target user, OR caller is admin by principal,
    // OR caller is anonymous AND callerUserId is an admin (password-auth admin)
    if (uid != userId and not isEffectiveAdmin(uid, callerUserId)) {
      return #err("Unauthorized")
    };
    switch (studentProfiles.get(userId)) {
      case (?_) #err("Student profile already exists");
      case null {
        let eid = Lib.enrollmentId(faculty, year, userId);
        let sp : Types.StudentProfile = {
          userId       = userId;
          faculty      = faculty;
          year         = year;
          enrollmentId = eid;
        };
        studentProfiles.add(userId, sp);
        #ok(sp)
      };
    }
  };

  public query func getStudentProfile(userId : Common.UserId) : async ?Types.StudentProfile {
    studentProfiles.get(userId)
  };

  public shared ({ caller }) func updateStudentFaculty(
    userId       : Common.UserId,
    faculty      : Text,
    callerUserId : Text,
  ) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (uid != userId and not isEffectiveAdmin(uid, callerUserId)) return #err("Unauthorized");
    switch (studentProfiles.get(userId)) {
      case null #err("Student profile not found");
      case (?sp) {
        studentProfiles.add(userId, { sp with faculty = faculty });
        #ok(())
      };
    }
  };

  public query func getTimetable(faculty : Text) : async [Types.TimetableEntry] {
    switch (timetables.get(faculty)) {
      case (?entries) entries;
      case null [];
    }
  };

  // ─────────────────────────────────────────────────────
  // 3. TEACHER MANAGEMENT
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func createTeacherProfile(
    userId       : Common.UserId,
    subject      : Text,
    callerUserId : Text,
  ) : async { #ok : Types.TeacherProfile; #err : Text } {
    let uid = callerId(caller);
    if (uid != userId and not isEffectiveAdmin(uid, callerUserId)) return #err("Unauthorized");
    switch (teacherProfiles.get(userId)) {
      case (?_) #err("Teacher profile already exists");
      case null {
        let tp : Types.TeacherProfile = {
          userId           = userId;
          subject          = subject;
          assignedStudents = [];
        };
        teacherProfiles.add(userId, tp);
        #ok(tp)
      };
    }
  };

  public query func getTeacherProfile(userId : Common.UserId) : async ?Types.TeacherProfile {
    teacherProfiles.get(userId)
  };

  public shared ({ caller }) func assignStudentToTeacher(
    teacherId    : Common.UserId,
    studentId    : Common.UserId,
    callerUserId : Text,
  ) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdmin(uid, callerUserId)) return #err("Unauthorized: admin only");
    if (not Lib.addStudentToTeacher(teacherProfiles, teacherId, studentId)) {
      return #err("Teacher not found")
    };
    #ok(())
  };

  public query func getAssignedStudents(teacherId : Common.UserId) : async [Types.UserProfile] {
    switch (teacherProfiles.get(teacherId)) {
      case null [];
      case (?tp) {
        let result = List.empty<Types.UserProfile>();
        for (sid in tp.assignedStudents.values()) {
          switch (userProfiles.get(sid)) {
            case (?p) result.add(p);
            case null {};
          }
        };
        result.toArray()
      };
    }
  };

  // ─────────────────────────────────────────────────────
  // 4. ATTENDANCE
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func markAttendance(
    records      : [Types.AttendanceRecord],
    callerUserId : Text,
  ) : async { #ok : Nat; #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdminOrTeacher(uid, callerUserId)) return #err("Unauthorized: teacher or admin only");
    var count = 0;
    for (r in records.values()) {
      let key = r.studentId # "|" # r.date # "|" # r.subject;
      attendance.add(key, r);
      count += 1;
    };
    #ok(count)
  };

  public query func getStudentAttendance(studentId : Common.UserId) : async [Types.AttendanceRecord] {
    let result = List.empty<Types.AttendanceRecord>();
    attendance.forEach(func(_, r) {
      if (r.studentId == studentId) result.add(r)
    });
    result.toArray()
  };

  public query func getAttendanceByDate(date : Text, teacherId : Common.UserId) : async [Types.AttendanceRecord] {
    let assignedStudents : [Text] = switch (teacherProfiles.get(teacherId)) {
      case null [];
      case (?tp) tp.assignedStudents;
    };
    let result = List.empty<Types.AttendanceRecord>();
    attendance.forEach(func(_, r) {
      if (r.date == date) {
        let inAssigned = assignedStudents.find(func s = s == r.studentId);
        switch (inAssigned) {
          case (?_) result.add(r);
          case null {};
        }
      }
    });
    result.toArray()
  };

  // ─────────────────────────────────────────────────────
  // 5. GRADES & QUIZZES
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func addGrade(grade : Types.Grade, callerUserId : Text) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdminOrTeacher(uid, callerUserId)) return #err("Unauthorized: teacher or admin only");
    let key = grade.studentId # "|" # grade.subject # "|" # grade.semester;
    grades.add(key, grade);
    #ok(())
  };

  public query func getStudentGrades(studentId : Common.UserId) : async [Types.Grade] {
    let result = List.empty<Types.Grade>();
    grades.forEach(func(_, g) {
      if (g.studentId == studentId) result.add(g)
    });
    result.toArray()
  };

  public shared ({ caller }) func addQuizResult(quiz : Types.QuizResult, callerUserId : Text) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdminOrTeacher(uid, callerUserId)) return #err("Unauthorized: teacher or admin only");
    quizResults.add(quiz.id, quiz);
    #ok(())
  };

  public query func getStudentQuizResults(studentId : Common.UserId) : async [Types.QuizResult] {
    let result = List.empty<Types.QuizResult>();
    quizResults.forEach(func(_, q) {
      if (q.studentId == studentId) result.add(q)
    });
    result.toArray()
  };

  // ─────────────────────────────────────────────────────
  // 6. OUTING REQUESTS
  // ─────────────────────────────────────────────────────

  public shared func submitOutingRequest(
    req : { studentId : Common.UserId; destination : Text; reason : Text; startDate : Text; endDate : Text }
  ) : async { #ok : Types.OutingRequest; #err : Text } {
    // Password-auth users connect as anonymous principal, so we skip caller check.
    // The studentId must exist as a registered student.
    switch (userProfiles.get(req.studentId)) {
      case null return #err("Student not found");
      case (?p) {
        if (p.role != #student and p.role != #admin) return #err("Unauthorized: student or admin only")
      };
    };
    let id = nextId("outing");
    let outingReq : Types.OutingRequest = {
      id            = id;
      studentId     = req.studentId;
      destination   = req.destination;
      reason        = req.reason;
      startDate     = req.startDate;
      endDate       = req.endDate;
      status        = #pending;
      reviewedBy    = null;
      reviewComment = null;
      createdAt     = Time.now();
    };
    outingRequests.add(id, outingReq);
    #ok(outingReq)
  };

  public query func getStudentOutingRequests(studentId : Common.UserId) : async [Types.OutingRequest] {
    let result = List.empty<Types.OutingRequest>();
    outingRequests.forEach(func(_, r) {
      if (r.studentId == studentId) result.add(r)
    });
    result.toArray()
  };

  public query func getPendingOutingRequests(teacherId : Common.UserId) : async [Types.OutingRequest] {
    // Password-auth users connect as anonymous principal; use teacherId param to determine role.
    // Both admins and teachers can call this — admins see all, teachers see all pending (not filtered).
    let result = List.empty<Types.OutingRequest>();
    let isAdm = switch (userProfiles.get(teacherId)) {
      case (? { role = #admin }) true;
      case _ false;
    };
    if (isAdm) {
      outingRequests.forEach(func(_, r) {
        if (r.status == #pending) result.add(r)
      });
    } else {
      // Teachers see all pending requests (not just assigned students) so they can help
      outingRequests.forEach(func(_, r) {
        if (r.status == #pending) result.add(r)
      });
    };
    result.toArray()
  };

  public query func getAllOutingRequests() : async [Types.OutingRequest] {
    // Open to all authenticated callers — password-auth users connect as anonymous principal.
    // Security is enforced at the frontend layer; this is read-only data.
    let result = List.empty<Types.OutingRequest>();
    outingRequests.forEach(func(_, r) { result.add(r) });
    result.toArray()
  };

  public shared func reviewOutingRequest(
    requestId  : Text,
    status     : Common.ApprovalStatus,
    comment    : ?Text,
    reviewerId : Common.UserId,
  ) : async { #ok : Types.OutingRequest; #err : Text } {
    // Password-auth users connect as anonymous principal; validate reviewer by their stored userId role.
    switch (userProfiles.get(reviewerId)) {
      case null return #err("Reviewer not found");
      case (?p) {
        if (p.role != #teacher and p.role != #admin) return #err("Unauthorized: teacher or admin only")
      };
    };
    switch (outingRequests.get(requestId)) {
      case null #err("Request not found");
      case (?req) {
        let updated : Types.OutingRequest = {
          req with
          status        = status;
          reviewedBy    = ?reviewerId;
          reviewComment = comment;
        };
        outingRequests.add(requestId, updated);
        #ok(updated)
      };
    }
  };

  // ─────────────────────────────────────────────────────
  // 7. NOTIFICATIONS
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func addNotification(
    notification : Types.Notification,
    callerUserId : Text,
  ) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdminOrTeacher(uid, callerUserId)) return #err("Unauthorized: teacher or admin only");
    notifications.add(notification.id, notification);
    #ok(())
  };

  public query func getUserNotifications(userId : Common.UserId) : async [Types.Notification] {
    let result = List.empty<Types.Notification>();
    notifications.forEach(func(_, n) {
      if (n.userId == userId) result.add(n)
    });
    result.toArray()
  };

  public shared ({ caller }) func markNotificationRead(
    notifId      : Text,
    userId       : Common.UserId,
    callerUserId : Text,
  ) : async { #ok : (); #err : Text } {
    let uid = callerId(caller);
    // Allow if: caller is the owner (by principal), OR anonymous caller with matching callerUserId
    let isOwner = uid == userId or (uid == anonymousPrincipal and callerUserId == userId);
    if (not isOwner) return #err("Unauthorized");
    if (not Lib.markNotifRead(notifications, notifId, userId)) {
      return #err("Notification not found or not yours")
    };
    #ok(())
  };

  // ─────────────────────────────────────────────────────
  // 8. ASSIGNMENTS
  // ─────────────────────────────────────────────────────

  public shared ({ caller }) func createAssignment(
    assignment   : Types.Assignment,
    callerUserId : Text,
  ) : async { #ok : Types.Assignment; #err : Text } {
    let uid = callerId(caller);
    if (not isEffectiveAdminOrTeacher(uid, callerUserId)) return #err("Unauthorized: teacher or admin only");
    assignments.add(assignment.id, assignment);
    #ok(assignment)
  };

  public query func getAssignmentsBySubject(subject : Text) : async [Types.Assignment] {
    let result = List.empty<Types.Assignment>();
    assignments.forEach(func(_, a) {
      if (a.subject == subject) result.add(a)
    });
    result.toArray()
  };

  public query func getStudentAssignments(studentId : Common.UserId) : async [Types.Assignment] {
    let result = List.empty<Types.Assignment>();
    assignments.forEach(func(_, a) {
      let inAssigned = a.assignedTo.find(func s = s == studentId);
      switch (inAssigned) {
        case (?_) result.add(a);
        case null {};
      }
    });
    result.toArray()
  };

};
