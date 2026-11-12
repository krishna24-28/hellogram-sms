/// Common cross-cutting types shared across all domains.
module {

  /// Unique user identifier (Principal as Text for serialization)
  public type UserId = Text;

  /// Unix timestamp in nanoseconds (Time.now() output)
  public type Timestamp = Int;

  /// User roles for role-based access control
  public type UserRole = {
    #student;
    #teacher;
    #admin;
  };

  /// Request/approval status for outing and other approval flows
  public type ApprovalStatus = {
    #pending;
    #approved;
    #denied;
  };

  /// Attendance record status
  public type AttendanceStatus = {
    #present;
    #absent;
    #late;
  };

  /// Credential for username/password login.
  /// passwordHash = SHA-256(username # "|" # password)
  public type PasswordCredential = {
    userId       : UserId;
    username     : Text;
    passwordHash : Text;
  };

};
