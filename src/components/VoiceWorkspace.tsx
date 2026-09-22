import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { askSouty } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Lang = "derja" | "french" | "english";
type Status = "ready" | "listening" | "thinking";

const LANGUAGES: { id: Lang; label: string; locale: string }[] = [
  { id: "derja", label: "Derja", locale: "ar-TN" },
  { id: "french", label: "Français", locale: "fr-FR" },
  { id: "english", label: "English", locale: "en-US" },
];

type Turn = { role: "user" | "assistant"; content: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionLike = any;

export function VoiceWorkspace() {
  const [lang, setLang] = useState<Lang>("derja");
  const [status, setStatus] = useState<Status>("ready");
  const [transcript, setTranscript] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike>(null);
  const finalRef = useRef("");

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setSupported(Boolean(w["SpeechRecognition"] || w["webkitSpeechRecognition"]));
  }, []);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;
      setStatus("thinking");
      setTurns((prev) => [...prev, { role: "user", content: clean }]);
      try {
        const history = turns.slice(-6);
        const result = await askSouty(clean, lang, history);
        setTurns((prev) => [...prev, { role: "assistant", content: result.reply }]);
        if ("speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance(result.reply);
          utter.lang = LANGUAGES.find((l) => l.id === lang)?.locale ?? "en-US";
          window.speechSynthesis.speak(utter);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Souty could not answer.");
      } finally {
        setStatus("ready");
        setTranscript("");
      }
    },
    [lang, turns],
  );

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setStatus("ready");
  }

  function startListening() {
    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
      | (new () => SpeechRecognitionLike)
      | undefined;
    if (!Ctor) {
      toast.error("Your browser can't listen yet. Try Chrome, or type your message.");
      return;
    }

    const recognition = new Ctor();
    recognition.lang = LANGUAGES.find((l) => l.id === lang)?.locale ?? "ar-TN";
    recognition.continuous = false;
    recognition.interimResults = true;
    finalRef.current = "";

    recognition.onresult = (event: { results: SpeechRecognitionLike; resultIndex: number }) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalRef.current += result[0].transcript;
        else interim += result[0].transcript;
      }
      setTranscript(finalRef.current + interim);
    };
    recognition.onerror = () => {
      setStatus("ready");
      toast.error("Didn't catch that. Try again.");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      const spoken = finalRef.current.trim();
      if (spoken) void send(spoken);
      else setStatus("ready");
    };

    recognitionRef.current = recognition;
    setTranscript("");
    setStatus("listening");
    recognition.start();
  }

  const statusLabel =
    status === "listening" ? "Listening…" : status === "thinking" ? "Thinking…" : "Ready";

  return (
    <div className="glass-card animate-rise rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Voice workspace</h2>
          <p className="text-sm text-muted-foreground">Talk naturally — Souty follows your language.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary p-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                lang === l.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="relative flex size-40 items-center justify-center">
          {status !== "ready" && (
            <>
              <span
                className={cn(
                  "absolute inset-0 rounded-full",
                  status === "listening" ? "bg-coral/30" : "bg-lime/30",
                  "animate-ring-pulse",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 rounded-full [animation-delay:0.8s]",
                  status === "listening" ? "bg-coral/20" : "bg-lime/20",
                  "animate-ring-pulse",
                )}
              />
            </>
          )}
          <button
            type="button"
            onClick={status === "listening" ? stopListening : startListening}
            disabled={status === "thinking"}
            aria-label={status === "listening" ? "Stop listening" : "Start talking"}
            className={cn(
              "relative flex size-24 items-center justify-center rounded-full transition-transform duration-300",
              "shadow-[var(--shadow-lift)] hover:scale-105 active:scale-95 disabled:opacity-70",
              status === "listening" ? "surface-live" : "surface-warm",
            )}
          >
            {status === "listening" ? (
              <Square className="size-8 text-lime-foreground" />
            ) : (
              <Mic className="size-9 text-coral-foreground" />
            )}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
          <span
            className={cn(
              "size-2 rounded-full",
              status === "ready" && "bg-muted-foreground",
              status === "listening" && "bg-coral animate-pulse",
              status === "thinking" && "bg-lime animate-pulse",
            )}
          />
          <span className="text-xs font-medium tracking-wide uppercase">{statusLabel}</span>
        </div>

        {status === "listening" && (
          <div className="mt-5 flex h-8 items-end gap-1.5" aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-1.5 origin-bottom rounded-full bg-coral animate-bar"
                style={{ height: "100%", animationDelay: `${i * 0.11}s` }}
              />
            ))}
          </div>
        )}

        {!supported && (
          <p className="mt-4 max-w-sm text-center text-xs text-muted-foreground">
            Live listening needs a Chromium-based browser. Everything else works fine here.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-secondary/60 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Live transcript
        </p>
        <p className="mt-2 min-h-6 text-base">
          {transcript || <span className="text-muted-foreground">Press the mic and speak…</span>}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {turns.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-primary" />
            Try: “Chnowa ta3mel el yom?”, “Résume-moi cette idée”, or “Give me 3 startup names”.
          </div>
        ) : (
          turns.map((turn, index) => (
            <div
              key={index}
              className={cn(
                "flex animate-rise",
                turn.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  turn.role === "user"
                    ? "surface-warm text-coral-foreground rounded-br-md"
                    : "bg-ink text-ink-foreground rounded-bl-md",
                )}
              >
                {turn.content}
              </div>
            </div>
          ))
        )}
      </div>

      {turns.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-6"
          onClick={() => setTurns([])}
        >
          <Trash2 className="size-4" />
          Clear conversation
        </Button>
      )}
    </div>
  );
}
