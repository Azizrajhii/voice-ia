import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const askSchema = z.object({
  transcript: z.string().min(1).max(4000),
  language: z.enum(["derja", "french", "english"]).default("derja"),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(10)
    .default([]),
});

const SYSTEM_PROMPT = `You are Souty, a warm, sharp Tunisian AI voice assistant.
You understand and speak Tunisian Derja (Arabic script or Latin "arabizi"), French and English.
Always answer in the SAME language and register the user used.
Be concise and conversational — this is spoken out loud. 1-4 short sentences unless more is truly needed.
You know Tunisian culture, cities, food, admin procedures and daily life. Be practical and friendly, never robotic.`;

export const askSouty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => askSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.history,
          { role: "user", content: data.transcript },
        ],
      }),
    });

    if (response.status === 429) throw new Error("Souty is busy right now. Try again in a moment.");
    if (response.status === 402) throw new Error("AI credits are exhausted. Please top up.");
    if (!response.ok) throw new Error("Souty could not answer that. Please try again.");

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) throw new Error("Souty returned an empty answer.");

    await context.supabase.from("messages").insert({
      user_id: context.userId,
      transcript: data.transcript,
      reply,
      language: data.language,
    });

    return { reply };
  });
