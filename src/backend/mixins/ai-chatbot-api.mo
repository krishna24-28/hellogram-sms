/// AI chatbot public API mixin for HELLOGRAM Student Management System.
/// Exposes multi-turn chat and study roadmap generation to callers.
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AIChatbot "../lib/ai-chatbot";
import Types "../types/ai-outcalls";

/// Mixin parameters:
///   apiKey   — the AI API key (empty string → safe fallback response)
///   transform — the actor-level query transform callback required by IC HTTP outcalls
mixin (apiKey : Text, transform : OutCall.Transform) {

  /// Send a full conversation history to the AI and receive a reply.
  /// The caller is responsible for maintaining history client-side and
  /// passing it with every call — this achieves multi-turn memory without
  /// storing any session state on the canister.
  public func sendChatMessage(
    messages : [Types.ChatMessage]
  ) : async { #ok : Text; #err : Text } {
    let result = await AIChatbot.askAI(messages, null, transform, apiKey);
    switch result {
      case (#ok(resp)) { #ok(resp.message) };
      case (#err(e))   { #err(e) };
    };
  };

  /// Generate a structured, phase-wise study roadmap for a given goal.
  /// Examples: "Data Structures", "GATE CS", "Full Stack Development", "VLSI Design", "Thermodynamics"
  public func generateStudyRoadmap(goal : Text) : async { #ok : Text; #err : Text } {
    let sysPrompt =
      "You are an expert academic advisor for engineering students. " #
      "You specialize in creating detailed, actionable study roadmaps for all engineering subjects and competitive exams. " #
      "Your roadmaps are practical, time-bound, and include specific resources.";

    let prompt =
      "Generate a detailed, structured study roadmap for an engineering student with the goal: \"" # goal # "\". " #
      "Include: " #
      "1) Phase-wise breakdown with realistic timelines (e.g., Week 1-2, Month 1, etc.), " #
      "2) Key subjects and topics to master in each phase, " #
      "3) Recommended textbooks (with author names) for each topic, " #
      "4) Recommended YouTube channels and online resources, " #
      "5) A sample daily study schedule (hours per topic), " #
      "6) Practice problems, previous year papers, and revision strategy, " #
      "7) Key milestones to measure progress. " #
      "Format with clear headings (##), subheadings (###), and bullet points for easy reading. " #
      "Make it comprehensive and actionable for an engineering student.";

    let messages : [Types.ChatMessage] = [{ role = "user"; content = prompt }];
    let result = await AIChatbot.askAI(messages, ?sysPrompt, transform, apiKey);
    switch result {
      case (#ok(resp)) { #ok(resp.message) };
      case (#err(e))   { #err(e) };
    };
  };

};
