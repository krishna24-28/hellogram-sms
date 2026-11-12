/// AI chatbot domain types for the HELLOGRAM Student Management System.
module {

  /// A single message in a chat conversation.
  /// role is "user" or "assistant" (matches OpenAI-compatible API convention).
  public type ChatMessage = {
    role    : Text;
    content : Text;
  };

  /// A chat request containing the full conversation history and optional context.
  public type ChatRequest = {
    messages : [ChatMessage];
    context  : ?Text;
  };

  /// The result returned by the AI for a given chat request.
  public type ChatResponse = {
    message : Text;
    success : Bool;
  };

};
