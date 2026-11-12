/// Hologram Student Management System — main actor.
/// Composes the AI chatbot mixin, users-academic domain mixins,
/// document uploads mixin, and the object-storage platform extension.
import OutCall          "mo:caffeineai-http-outcalls/outcall";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AIChatbotApi     "mixins/ai-chatbot-api";
import UploadsApi       "mixins/uploads-api";
import Map              "mo:core/Map";
import List             "mo:core/List";
import Types            "types/types";
import Common           "types/common";
import Lib              "lib/users-academic";
import UsersAcademicMixin "mixins/users-academic-api";



actor {

  // ── AI configuration ─────────────────────────────────────────────────────
  let AI_API_KEY : Text = "";

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  include AIChatbotApi(AI_API_KEY, transform);

  // ── Object-storage platform extension ────────────────────────────────────
  include MixinObjectStorage();

  // ── Users & Academic state ────────────────────────────────────────────────

  let roles           = Map.empty<Text, Common.UserRole>();
  let userProfiles    = Map.empty<Text, Types.UserProfile>();
  let studentProfiles = Map.empty<Text, Types.StudentProfile>();
  let teacherProfiles = Map.empty<Text, Types.TeacherProfile>();
  let attendance      = Map.empty<Text, Types.AttendanceRecord>();
  let grades          = Map.empty<Text, Types.Grade>();
  let quizResults     = Map.empty<Text, Types.QuizResult>();
  let outingRequests  = Map.empty<Text, Types.OutingRequest>();
  let notifications   = Map.empty<Text, Types.Notification>();
  let assignments     = Map.empty<Text, Types.Assignment>();
  let timetables      = Lib.buildTimetables();

  // Monotonic counter stored as a mutable single-element List
  let idCounter = List.singleton<Nat>(0);

  // ── Password-based auth state ─────────────────────────────────────────────

  /// username (lowercase) -> PasswordCredential
  let passwordCredentials = Map.empty<Text, Common.PasswordCredential>();

  /// Singleton flag: List contains `true` once Krishna admin has been seeded.
  /// Empty on first deploy → mixin seeds admin and adds `true`.
  let adminSeeded = List.empty<Bool>();

  include UsersAcademicMixin(
    roles,
    userProfiles,
    studentProfiles,
    teacherProfiles,
    attendance,
    grades,
    quizResults,
    outingRequests,
    notifications,
    assignments,
    timetables,
    idCounter,
    passwordCredentials,
    adminSeeded,
  );

  // ── Document uploads state ────────────────────────────────────────────────

  /// Document metadata keyed by docId
  let documentMeta  = Map.empty<Text, Types.DocumentMeta>();
  /// Raw document blobs keyed by docId
  let documentBlobs = Map.empty<Text, Blob>();

  include UploadsApi(
    roles,
    documentMeta,
    documentBlobs,
    idCounter,
  );

  // ── Post-upgrade lifecycle: re-seed admin if credential was lost ──────────

  func seedAdminIfNeeded() : () {
    let krishnaId = "admin-krishna";
    let expectedHash = Lib.hashPassword("krishna", "53083");
    switch (passwordCredentials.get("krishna")) {
      case null {
        passwordCredentials.add("krishna", {
          userId       = krishnaId;
          username     = "krishna";
          passwordHash = expectedHash;
        });
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
          passwordCredentials.add("krishna", { cred with passwordHash = expectedHash });
        };
      };
    };
  };

  system func postupgrade() {
    seedAdminIfNeeded();
  };

};
