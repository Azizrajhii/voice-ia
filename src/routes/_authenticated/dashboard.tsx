import { createFileRoute } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";
import { VoiceWorkspace } from "@/components/VoiceWorkspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Souty Dashboard — Your Tunisian Voice Workspace" },
      {
        name: "description",
        content:
          "Speak in Derja, French or English and get instant AI answers in your Souty voice workspace.",
      },
      { property: "og:title", content: "Souty Dashboard" },
      {
        property: "og:description",
        content: "Your voice workspace: microphone, live transcript and instant AI replies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <header className="surface-hero relative overflow-hidden text-ink-foreground">
        <div className="pointer-events-none absolute -right-20 -top-24 size-96 rounded-full bg-lime/15 blur-3xl animate-drift" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
          <p className="text-xs tracking-[0.2em] text-ink-muted uppercase">Voice workspace</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Ahla, {user?.name ?? user?.email?.split("@")[0] ?? "friend"}.
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Press the mic and talk however you talk — Derja, French or English. Souty answers back.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-10 max-w-2xl px-6 pb-20">
        <VoiceWorkspace />
      </main>
    </div>
  );
}
