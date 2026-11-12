/// Domain logic for user management, student/teacher profiles, attendance,
/// grades, quizzes, outing requests, notifications, and assignments.
import Map    "mo:core/Map";
import Text   "mo:core/Text";
import Types  "../types/types";
import Common "../types/common";
import SHA256 "sha256";

module {

  // ─────────────────────────────────────────────
  // PASSWORD HELPERS
  // ─────────────────────────────────────────────

  /// Hashes a username+password pair using SHA-256.
  /// Input: username # "|" # password
  public func hashPassword(username : Text, password : Text) : Text {
    SHA256.hash(username # "|" # password)
  };

  /// Verifies a plaintext password against a stored hash.
  public func verifyPassword(username : Text, password : Text, storedHash : Text) : Bool {
    SHA256.hash(username # "|" # password) == storedHash
  };

  // ─────────────────────────────────────────────
  // ID GENERATION
  // ─────────────────────────────────────────────

  public func genId(prefix : Text, counter : Nat) : Text {
    prefix # "-" # counter.toText()
  };

  public func enrollmentId(faculty : Text, year : Nat, userId : Text) : Text {
    let f = if (faculty.size() >= 2) {
      Text.fromIter(faculty.toIter().take(2))
    } else { faculty };
    f # year.toText() # "-" # (userId.size().toText())
  };

  // ─────────────────────────────────────────────
  // TIMETABLE SEED DATA
  // ─────────────────────────────────────────────

  public func buildTimetables() : Map.Map<Text, [Types.TimetableEntry]> {
    let timetables = Map.empty<Text, [Types.TimetableEntry]>();

    // Computer Science timetable
    let cs : [Types.TimetableEntry] = [
      { day = "Monday";    subject = "Data Structures";       time = "09:00-10:00"; room = "CS-101"; teacher = "Dr. Rajan" },
      { day = "Monday";    subject = "Algorithms";            time = "10:00-11:00"; room = "CS-102"; teacher = "Dr. Priya" },
      { day = "Monday";    subject = "Database Systems";      time = "11:00-12:00"; room = "CS-103"; teacher = "Dr. Mohan" },
      { day = "Monday";    subject = "Computer Networks";     time = "14:00-15:00"; room = "CS-104"; teacher = "Dr. Anita" },
      { day = "Monday";    subject = "Operating Systems";     time = "15:00-16:00"; room = "CS-105"; teacher = "Dr. Suresh" },
      { day = "Tuesday";   subject = "Web Development";       time = "09:00-10:00"; room = "CS-101"; teacher = "Dr. Rajan" },
      { day = "Tuesday";   subject = "Machine Learning";      time = "10:00-11:00"; room = "CS-102"; teacher = "Dr. Priya" },
      { day = "Tuesday";   subject = "Data Structures";       time = "11:00-12:00"; room = "CS-103"; teacher = "Dr. Mohan" },
      { day = "Tuesday";   subject = "Algorithms";            time = "14:00-15:00"; room = "CS-104"; teacher = "Dr. Anita" },
      { day = "Tuesday";   subject = "Computer Networks";     time = "15:00-16:00"; room = "CS-105"; teacher = "Dr. Suresh" },
      { day = "Wednesday"; subject = "Database Systems";      time = "09:00-10:00"; room = "CS-101"; teacher = "Dr. Rajan" },
      { day = "Wednesday"; subject = "Operating Systems";     time = "10:00-11:00"; room = "CS-102"; teacher = "Dr. Priya" },
      { day = "Wednesday"; subject = "Web Development";       time = "11:00-12:00"; room = "CS-103"; teacher = "Dr. Mohan" },
      { day = "Wednesday"; subject = "Machine Learning";      time = "14:00-15:00"; room = "CS-104"; teacher = "Dr. Anita" },
      { day = "Wednesday"; subject = "Data Structures";       time = "15:00-16:00"; room = "CS-105"; teacher = "Dr. Suresh" },
      { day = "Thursday";  subject = "Algorithms";            time = "09:00-10:00"; room = "CS-101"; teacher = "Dr. Rajan" },
      { day = "Thursday";  subject = "Computer Networks";     time = "10:00-11:00"; room = "CS-102"; teacher = "Dr. Priya" },
      { day = "Thursday";  subject = "Database Systems";      time = "11:00-12:00"; room = "CS-103"; teacher = "Dr. Mohan" },
      { day = "Thursday";  subject = "Web Development";       time = "14:00-15:00"; room = "CS-104"; teacher = "Dr. Anita" },
      { day = "Thursday";  subject = "Operating Systems";     time = "15:00-16:00"; room = "CS-105"; teacher = "Dr. Suresh" },
      { day = "Friday";    subject = "Machine Learning";      time = "09:00-10:00"; room = "CS-101"; teacher = "Dr. Rajan" },
      { day = "Friday";    subject = "Data Structures";       time = "10:00-11:00"; room = "CS-102"; teacher = "Dr. Priya" },
      { day = "Friday";    subject = "Algorithms";            time = "11:00-12:00"; room = "CS-103"; teacher = "Dr. Mohan" },
      { day = "Friday";    subject = "Lab: Programming";      time = "14:00-16:00"; room = "CS-Lab"; teacher = "Dr. Suresh" },
    ];

    // Electronics timetable
    let ec : [Types.TimetableEntry] = [
      { day = "Monday";    subject = "Circuit Theory";        time = "09:00-10:00"; room = "EC-101"; teacher = "Dr. Kumar" },
      { day = "Monday";    subject = "Digital Electronics";   time = "10:00-11:00"; room = "EC-102"; teacher = "Dr. Latha" },
      { day = "Monday";    subject = "Signals & Systems";     time = "11:00-12:00"; room = "EC-103"; teacher = "Dr. Venkat" },
      { day = "Monday";    subject = "Microprocessors";       time = "14:00-15:00"; room = "EC-104"; teacher = "Dr. Geetha" },
      { day = "Monday";    subject = "Electromagnetics";      time = "15:00-16:00"; room = "EC-105"; teacher = "Dr. Rajesh" },
      { day = "Tuesday";   subject = "VLSI Design";           time = "09:00-10:00"; room = "EC-101"; teacher = "Dr. Kumar" },
      { day = "Tuesday";   subject = "Communication Sys";     time = "10:00-11:00"; room = "EC-102"; teacher = "Dr. Latha" },
      { day = "Tuesday";   subject = "Circuit Theory";        time = "11:00-12:00"; room = "EC-103"; teacher = "Dr. Venkat" },
      { day = "Tuesday";   subject = "Digital Electronics";   time = "14:00-15:00"; room = "EC-104"; teacher = "Dr. Geetha" },
      { day = "Tuesday";   subject = "Signals & Systems";     time = "15:00-16:00"; room = "EC-105"; teacher = "Dr. Rajesh" },
      { day = "Wednesday"; subject = "Microprocessors";       time = "09:00-10:00"; room = "EC-101"; teacher = "Dr. Kumar" },
      { day = "Wednesday"; subject = "Electromagnetics";      time = "10:00-11:00"; room = "EC-102"; teacher = "Dr. Latha" },
      { day = "Wednesday"; subject = "VLSI Design";           time = "11:00-12:00"; room = "EC-103"; teacher = "Dr. Venkat" },
      { day = "Wednesday"; subject = "Communication Sys";     time = "14:00-15:00"; room = "EC-104"; teacher = "Dr. Geetha" },
      { day = "Wednesday"; subject = "Circuit Theory";        time = "15:00-16:00"; room = "EC-105"; teacher = "Dr. Rajesh" },
      { day = "Thursday";  subject = "Digital Electronics";   time = "09:00-10:00"; room = "EC-101"; teacher = "Dr. Kumar" },
      { day = "Thursday";  subject = "Signals & Systems";     time = "10:00-11:00"; room = "EC-102"; teacher = "Dr. Latha" },
      { day = "Thursday";  subject = "Microprocessors";       time = "11:00-12:00"; room = "EC-103"; teacher = "Dr. Venkat" },
      { day = "Thursday";  subject = "VLSI Design";           time = "14:00-15:00"; room = "EC-104"; teacher = "Dr. Geetha" },
      { day = "Thursday";  subject = "Electromagnetics";      time = "15:00-16:00"; room = "EC-105"; teacher = "Dr. Rajesh" },
      { day = "Friday";    subject = "Communication Sys";     time = "09:00-10:00"; room = "EC-101"; teacher = "Dr. Kumar" },
      { day = "Friday";    subject = "Circuit Theory";        time = "10:00-11:00"; room = "EC-102"; teacher = "Dr. Latha" },
      { day = "Friday";    subject = "Lab: Electronics";      time = "11:00-13:00"; room = "EC-Lab"; teacher = "Dr. Venkat" },
      { day = "Friday";    subject = "Lab: Digital";          time = "14:00-16:00"; room = "EC-Lab"; teacher = "Dr. Geetha" },
    ];

    // Mechanical timetable
    let me : [Types.TimetableEntry] = [
      { day = "Monday";    subject = "Engineering Mechanics"; time = "09:00-10:00"; room = "ME-101"; teacher = "Dr. Sharma" },
      { day = "Monday";    subject = "Thermodynamics";        time = "10:00-11:00"; room = "ME-102"; teacher = "Dr. Patel" },
      { day = "Monday";    subject = "Fluid Mechanics";       time = "11:00-12:00"; room = "ME-103"; teacher = "Dr. Singh" },
      { day = "Monday";    subject = "Machine Design";        time = "14:00-15:00"; room = "ME-104"; teacher = "Dr. Verma" },
      { day = "Monday";    subject = "Manufacturing Proc";    time = "15:00-16:00"; room = "ME-105"; teacher = "Dr. Nair" },
      { day = "Tuesday";   subject = "CAD/CAM";               time = "09:00-10:00"; room = "ME-101"; teacher = "Dr. Sharma" },
      { day = "Tuesday";   subject = "Heat Transfer";         time = "10:00-11:00"; room = "ME-102"; teacher = "Dr. Patel" },
      { day = "Tuesday";   subject = "Engineering Mechanics"; time = "11:00-12:00"; room = "ME-103"; teacher = "Dr. Singh" },
      { day = "Tuesday";   subject = "Thermodynamics";        time = "14:00-15:00"; room = "ME-104"; teacher = "Dr. Verma" },
      { day = "Tuesday";   subject = "Fluid Mechanics";       time = "15:00-16:00"; room = "ME-105"; teacher = "Dr. Nair" },
      { day = "Wednesday"; subject = "Machine Design";        time = "09:00-10:00"; room = "ME-101"; teacher = "Dr. Sharma" },
      { day = "Wednesday"; subject = "Manufacturing Proc";    time = "10:00-11:00"; room = "ME-102"; teacher = "Dr. Patel" },
      { day = "Wednesday"; subject = "CAD/CAM";               time = "11:00-12:00"; room = "ME-103"; teacher = "Dr. Singh" },
      { day = "Wednesday"; subject = "Heat Transfer";         time = "14:00-15:00"; room = "ME-104"; teacher = "Dr. Verma" },
      { day = "Wednesday"; subject = "Engineering Mechanics"; time = "15:00-16:00"; room = "ME-105"; teacher = "Dr. Nair" },
      { day = "Thursday";  subject = "Thermodynamics";        time = "09:00-10:00"; room = "ME-101"; teacher = "Dr. Sharma" },
      { day = "Thursday";  subject = "Fluid Mechanics";       time = "10:00-11:00"; room = "ME-102"; teacher = "Dr. Patel" },
      { day = "Thursday";  subject = "Machine Design";        time = "11:00-12:00"; room = "ME-103"; teacher = "Dr. Singh" },
      { day = "Thursday";  subject = "CAD/CAM";               time = "14:00-15:00"; room = "ME-104"; teacher = "Dr. Verma" },
      { day = "Thursday";  subject = "Manufacturing Proc";    time = "15:00-16:00"; room = "ME-105"; teacher = "Dr. Nair" },
      { day = "Friday";    subject = "Heat Transfer";         time = "09:00-10:00"; room = "ME-101"; teacher = "Dr. Sharma" },
      { day = "Friday";    subject = "Engineering Mechanics"; time = "10:00-11:00"; room = "ME-102"; teacher = "Dr. Patel" },
      { day = "Friday";    subject = "Lab: Mechanics";        time = "11:00-13:00"; room = "ME-Lab"; teacher = "Dr. Singh" },
      { day = "Friday";    subject = "Lab: Manufacturing";    time = "14:00-16:00"; room = "ME-Lab"; teacher = "Dr. Nair" },
    ];

    timetables.add("Computer Science", cs);
    timetables.add("Electronics", ec);
    timetables.add("Mechanical", me);
    timetables
  };

  // ─────────────────────────────────────────────
  // USER HELPERS
  // ─────────────────────────────────────────────

  public func isAdmin(
    roles : Map.Map<Text, Common.UserRole>,
    userId : Text,
  ) : Bool {
    switch (roles.get(userId)) {
      case (? #admin) true;
      case _ false;
    }
  };

  public func isTeacher(
    roles : Map.Map<Text, Common.UserRole>,
    userId : Text,
  ) : Bool {
    switch (roles.get(userId)) {
      case (? #teacher) true;
      case _ false;
    }
  };

  public func isStudent(
    roles : Map.Map<Text, Common.UserRole>,
    userId : Text,
  ) : Bool {
    switch (roles.get(userId)) {
      case (? #student) true;
      case _ false;
    }
  };

  public func isAdminOrTeacher(
    roles : Map.Map<Text, Common.UserRole>,
    userId : Text,
  ) : Bool {
    isAdmin(roles, userId) or isTeacher(roles, userId)
  };

  // ─────────────────────────────────────────────
  // TEACHER PROFILE MUTATION HELPER
  // ─────────────────────────────────────────────

  /// Adds a studentId to a teacher's assignedStudents list.
  public func addStudentToTeacher(
    teacherProfiles : Map.Map<Text, Types.TeacherProfile>,
    teacherId : Text,
    studentId : Text,
  ) : Bool {
    switch (teacherProfiles.get(teacherId)) {
      case null false;
      case (?tp) {
        let already = tp.assignedStudents.find(func s = s == studentId);
        switch (already) {
          case (?_) true; // already assigned
          case null {
            let updated : Types.TeacherProfile = {
              tp with assignedStudents = tp.assignedStudents.concat([studentId])
            };
            teacherProfiles.add(teacherId, updated);
            true
          };
        }
      };
    }
  };

  // ─────────────────────────────────────────────
  // NOTIFICATION MUTATION HELPER
  // ─────────────────────────────────────────────

  public func markNotifRead(
    notifications : Map.Map<Text, Types.Notification>,
    notifId : Text,
    userId : Text,
  ) : Bool {
    switch (notifications.get(notifId)) {
      case null false;
      case (?n) {
        if (n.userId != userId) false
        else {
          notifications.add(notifId, { n with read = true });
          true
        }
      };
    }
  };

};
