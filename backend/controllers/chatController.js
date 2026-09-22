import { createMessage } from '../models/Message.js';
import { retryFetch } from '../lib/retryFetch.js';
import { validateChatBody, toGeminiContents, extractReplyText } from '../lib/chat.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `You are Souty, a warm, sharp Tunisian AI voice assistant.
You understand and speak Tunisian Derja (Arabic script or Latin "arabizi"), French and English.
Always answer in the SAME language and register the user used.
Be concise and conversational — this is spoken out loud. 1-4 short sentences unless more is truly needed.
You know Tunisian culture, cities, food, admin procedures and daily life. Be practical and friendly, never robotic.`;

export async function postChat(req, res) {
  try {
    const { error, value } = validateChatBody(req.body);
    if (error) return res.status(400).json({ message: error });
    const { transcript, language, history } = value;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'AI is not configured yet.' });
    }

    // Gemini's free tier occasionally returns 503 ("model overloaded") under
    // load — transient, so a couple of short retries clears most of them
    // without the caller noticing. 429 (quota) is not retried since the
    // quota window won't have passed by the next attempt.
    const response = await retryFetch(
      () =>
        fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: toGeminiContents(history, transcript),
          }),
        }),
      { retryOnStatus: (status) => status === 503 },
    );

    if (response.status === 429) {
      return res.status(429).json({ message: 'Souty is busy right now. Try again in a moment.' });
    }
    if (response.status === 503) {
      return res
        .status(503)
        .json({ message: 'Souty is overloaded right now. Please try again in a few seconds.' });
    }
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);
      return res.status(502).json({ message: 'Souty could not answer that. Please try again.' });
    }

    const payload = await response.json();
    const reply = extractReplyText(payload);
    if (!reply) {
      return res.status(502).json({ message: 'Souty returned an empty answer.' });
    }

    await createMessage({ userId: req.userId, transcript, reply, language });

    return res.json({ reply });
  } catch (error) {
    console.error('Error in chat handler:', error);
    return res.status(500).json({ message: 'Souty could not answer that. Please try again.' });
  }
}
