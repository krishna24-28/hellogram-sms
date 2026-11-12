/// AI chatbot domain logic — calls an external AI API via HTTP outcalls.
/// Falls back to a helpful demo message when no API key is configured.
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/ai-outcalls";
import Error "mo:core/Error";
import Text "mo:core/Text";

module {

  public type ChatMessage  = Types.ChatMessage;
  public type ChatResponse = Types.ChatResponse;

  // ── Constants ─────────────────────────────────────────────────────────────

  func defaultPrompt() : Text =
    "You are an AI academic assistant for HELLOGRAM Student Management System, specifically designed for engineering students. " #
    "You have deep expertise in all engineering branches including Computer Science (CS), Electronics & Communication Engineering (ECE), and Mechanical Engineering (ME). " #
    "You can answer questions about: " #
    "CS subjects: Data Structures, Algorithms, Operating Systems, DBMS, Computer Networks, Software Engineering, Theory of Computation, Compiler Design, Machine Learning, Artificial Intelligence, Web Development, Object-Oriented Programming, Computer Architecture, Discrete Mathematics, Digital Logic Design; " #
    "ECE subjects: Digital Electronics, Signals & Systems, Analog Electronics, Microprocessors, VLSI Design, Communication Systems, Electromagnetics, Circuit Theory, Control Systems, Embedded Systems; " #
    "ME subjects: Engineering Mechanics, Thermodynamics, Fluid Mechanics, Machine Design, Manufacturing Processes, Heat Transfer, CAD/CAM, Strength of Materials, Industrial Engineering; " #
    "Common subjects: Engineering Mathematics (Calculus, Linear Algebra, Differential Equations, Probability & Statistics), Engineering Physics, Engineering Chemistry, Environmental Engineering. " #
    "Always provide accurate, educational, and well-structured answers. " #
    "For complex topics, explain step-by-step with examples. " #
    "Recommend relevant resources like textbooks and online courses when helpful. " #
    "Be encouraging and supportive to students. Format responses with clear headings and bullet points when appropriate.";

  let API_URL : Text = "https://api.openai.com/v1/chat/completions";

  // ── Text helpers ──────────────────────────────────────────────────────────

  /// Minimal JSON string escaping.
  func escapeJson(s : Text) : Text {
    var out : Text = "";
    for (c in s.chars()) {
      if      (c == '\"') { out #= "\\\"" }
      else if (c == '\\') { out #= "\\\\" }
      else if (c == '\n') { out #= "\\n"  }
      else if (c == '\r') { out #= "\\r"  }
      else if (c == '\t') { out #= "\\t"  }
      else                { out #= Text.fromChar(c) };
    };
    out
  };

  /// Serialize a ChatMessage array to a JSON array string.
  func messagesToJson(messages : [ChatMessage]) : Text {
    var parts : Text = "";
    var i = 0;
    for (msg in messages.vals()) {
      if (i > 0) { parts #= "," };
      parts #= "{\"role\":\"" # escapeJson(msg.role) # "\",\"content\":\"" # escapeJson(msg.content) # "\"}";
      i += 1;
    };
    "[" # parts # "]"
  };

  /// Find the first occurrence of `needle` in `haystack`.
  func findIn(haystack : Text, needle : Text) : ?Nat {
    let hArr = haystack.toArray();
    let nArr = needle.toArray();
    let hLen = hArr.size();
    let nLen = nArr.size();
    if (nLen == 0) return ?0;
    var i = 0;
    label scan loop {
      if (i + nLen > hLen) break scan;
      var j = 0;
      var matched = true;
      while (j < nLen) {
        if (hArr[i + j] != nArr[j]) { matched := false };
        j += 1;
      };
      if (matched) return ?i;
      i += 1;
    };
    null
  };

  /// Find the closing unescaped `"` in a JSON string value starting at `from`.
  func findClosingQuote(arr : [Char], from : Nat) : ?Nat {
    var i = from;
    while (i < arr.size()) {
      if (arr[i] == '\"') {
        var bs = 0;
        var k = i;
        while (k > 0 and arr[k - 1] == '\\') { bs += 1; k -= 1 };
        if (bs % 2 == 0) return ?i;
      };
      i += 1;
    };
    null
  };

  /// Extract a substring [from, to) by char index.
  func slice(arr : [Char], from : Nat, to : Nat) : Text {
    var out : Text = "";
    var i = from;
    while (i < to and i < arr.size()) {
      out #= Text.fromChar(arr[i]);
      i += 1;
    };
    out
  };

  /// Reverse JSON string escaping on an extracted value.
  func unescapeJson(s : Text) : Text {
    let arr = s.toArray();
    var out : Text = "";
    var i = 0;
    while (i < arr.size()) {
      if (arr[i] == '\\' and i + 1 < arr.size()) {
        let n = arr[i + 1];
        if      (n == '\"') { out #= "\""; i += 2 }
        else if (n == '\\') { out #= "\\"; i += 2 }
        else if (n == 'n')  { out #= "\n"; i += 2 }
        else if (n == 'r')  { out #= "\r"; i += 2 }
        else if (n == 't')  { out #= "\t"; i += 2 }
        else                { out #= Text.fromChar(arr[i]); i += 1 };
      } else {
        out #= Text.fromChar(arr[i]);
        i += 1;
      };
    };
    out
  };

  /// Extract the first "content":"..." value from an OpenAI JSON response.
  func extractContent(json : Text) : ?Text {
    let marker = "\"content\":\"";
    switch (findIn(json, marker)) {
      case null { null };
      case (?start) {
        let valueStart = start + marker.size();
        let arr = json.toArray();
        switch (findClosingQuote(arr, valueStart)) {
          case null { null };
          case (?valueEnd) { ?unescapeJson(slice(arr, valueStart, valueEnd)) };
        };
      };
    };
  };

  // ── Public function ───────────────────────────────────────────────────────

  /// Call the external AI API with the full conversation history.
  /// Pass systemPrompt override or null to use the built-in HELLOGRAM prompt.
  /// Falls back gracefully when apiKey is empty.
  public func askAI(
    messages     : [ChatMessage],
    systemPrompt : ?Text,
    transform    : OutCall.Transform,
    apiKey       : Text,
  ) : async { #ok : ChatResponse; #err : Text } {
    if (apiKey == "") {
      return #ok({
        message =
          "👋 I'm your HELLOGRAM Academic AI Assistant! " #
          "To unlock full AI responses, configure an API key in the backend settings. " #
          "I can help you with: academic concepts, study strategies, " #
          "resource recommendations, and roadmap planning. " #
          "What would you like to explore today?";
        success = true;
      });
    };

    let sysPrompt = switch systemPrompt { case (?p) p; case null defaultPrompt() };
    let sysJson   = "{\"role\":\"system\",\"content\":\"" # escapeJson(sysPrompt) # "\"}";
    let histJson  = messagesToJson(messages);
    // Merge system message at the front of the history array
    let histBody  = slice(histJson.toArray(), 1, histJson.size() - 1);
    let allMsgs   = if (histBody == "") "[" # sysJson # "]"
                    else "[" # sysJson # "," # histBody # "]";

    let body = "{\"model\":\"gpt-4o-mini\",\"messages\":" # allMsgs # ",\"max_tokens\":1024,\"temperature\":0.7}";

    let headers : [OutCall.Header] = [
      { name = "Content-Type";  value = "application/json" },
      { name = "Authorization"; value = "Bearer " # apiKey },
    ];

    try {
      let raw = await OutCall.httpPostRequest(API_URL, headers, body, transform);
      switch (extractContent(raw)) {
        case (?content) { #ok({ message = content; success = true }) };
        case null {
          #ok({
            message = "Received an AI response but could not parse it. Please try again.";
            success = false;
          })
        };
      };
    } catch (e) {
      #err("AI service error: " # e.message())
    };
  };

};
