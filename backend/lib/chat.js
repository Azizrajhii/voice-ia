export const LANGUAGES = new Set(["derja", "french", "english"]);

export function validateChatBody(body) {
  const { transcript, language = "derja", history = [] } = body || {};

  if (typeof transcript !== "string" || !transcript.trim() || transcript.length > 4000) {
    return { error: "transcript is required (max 4000 chars)" };
  }
  if (!LANGUAGES.has(language)) {
    return { error: "language must be derja, french, or english" };
  }
  if (!Array.isArray(history) || history.length > 10) {
    return { error: "history must be an array of at most 10 turns" };
  }

  return { value: { transcript, language, history } };
}

export function toGeminiContents(history, transcript) {
  const cleanHistory = history
    .filter(
      (turn) =>
        turn &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string",
    )
    .map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.content.slice(0, 4000) }],
    }));

  return [...cleanHistory, { role: "user", parts: [{ text: transcript }] }];
}

export function extractReplyText(payload) {
  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join("")
      .trim() ?? ""
  );
}
