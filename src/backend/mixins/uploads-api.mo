/// Document upload/download API mixin.
/// Stores raw Blob content in a Map keyed by docId and
/// tracks document metadata separately.
/// Requires the object-storage platform extension to be included in main.mo.
import Map     "mo:core/Map";
import List    "mo:core/List";
import Text    "mo:core/Text";
import Time    "mo:core/Time";
import Types   "../types/types";
import Common  "../types/common";
import Lib     "../lib/users-academic";

mixin (
  /// roles map for authorization checks
  roles         : Map.Map<Text, Common.UserRole>,
  /// document metadata keyed by docId
  documentMeta  : Map.Map<Text, Types.DocumentMeta>,
  /// raw blob content keyed by docId
  documentBlobs : Map.Map<Text, Blob>,
  /// monotonic counter shared with the main domain
  idCounter     : List.List<Nat>,
) {

  // ─────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────────────

  func nextDocId() : Text {
    let cur = switch (idCounter.first()) { case (?n) n; case null 0 };
    idCounter.mapInPlace(func _ = cur + 1);
    if (idCounter.isEmpty()) { idCounter.add(cur + 1) };
    "doc-" # (cur + 1).toText()
  };

  func uploadsCallerId(caller : Principal) : Text { caller.toText() };

  // ─────────────────────────────────────────────────────
  // UPLOAD
  // ─────────────────────────────────────────────────────

  /// Upload a document. Any authenticated user (student, teacher, admin) may upload.
  /// Returns the new document metadata.
  public shared ({ caller }) func uploadDocument(
    fileName     : Text,
    fileData     : Blob,
    category     : Types.DocumentCategory,
    assignmentId : ?Text,
  ) : async { #ok : Types.DocumentMeta; #err : Text } {
    let uid = uploadsCallerId(caller);
    // Must be a known user
    switch (roles.get(uid)) {
      case null return #err("Unauthorized: user not registered");
      case _ {};
    };
    if (fileName.size() == 0) return #err("File name is required");
    if (fileData.size() == 0) return #err("File content is empty");

    let docId = nextDocId();
    let meta : Types.DocumentMeta = {
      id           = docId;
      uploadedBy   = uid;
      fileName     = fileName;
      category     = category;
      uploadedAt   = Time.now();
      assignmentId = assignmentId;
    };
    documentMeta.add(docId, meta);
    documentBlobs.add(docId, fileData);
    #ok(meta)
  };

  // ─────────────────────────────────────────────────────
  // DOWNLOAD
  // ─────────────────────────────────────────────────────

  /// Download document content by id.
  /// Returns null if not found.
  public query func getDocumentContent(docId : Text) : async ?Blob {
    documentBlobs.get(docId)
  };

  // ─────────────────────────────────────────────────────
  // LIST / QUERY
  // ─────────────────────────────────────────────────────

  /// List all document metadata (admin only).
  public query ({ caller }) func getAllDocuments() : async [Types.DocumentMeta] {
    let uid = uploadsCallerId(caller);
    if (not Lib.isAdmin(roles, uid)) {
      return []
    };
    let result = List.empty<Types.DocumentMeta>();
    documentMeta.forEach(func(_, d) { result.add(d) });
    result.toArray()
  };

  /// Get documents uploaded by a specific user.
  public query func getUserDocuments(userId : Common.UserId) : async [Types.DocumentMeta] {
    let result = List.empty<Types.DocumentMeta>();
    documentMeta.forEach(func(_, d) {
      if (d.uploadedBy == userId) result.add(d)
    });
    result.toArray()
  };

  /// Get documents attached to a specific assignment.
  public query func getAssignmentDocuments(assignmentId : Text) : async [Types.DocumentMeta] {
    let result = List.empty<Types.DocumentMeta>();
    documentMeta.forEach(func(_, d) {
      switch (d.assignmentId) {
        case (?aid) { if (aid == assignmentId) result.add(d) };
        case null {};
      }
    });
    result.toArray()
  };

  /// Get a single document's metadata by id.
  public query func getDocumentMeta(docId : Text) : async ?Types.DocumentMeta {
    documentMeta.get(docId)
  };

  /// Delete a document (uploader or admin only).
  public shared ({ caller }) func deleteDocument(docId : Text) : async { #ok : (); #err : Text } {
    let uid = uploadsCallerId(caller);
    switch (documentMeta.get(docId)) {
      case null #err("Document not found");
      case (?d) {
        if (d.uploadedBy != uid and not Lib.isAdmin(roles, uid)) {
          return #err("Unauthorized: not your document")
        };
        documentMeta.remove(docId);
        documentBlobs.remove(docId);
        #ok(())
      };
    }
  };

};
