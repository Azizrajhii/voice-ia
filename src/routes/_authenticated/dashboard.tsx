import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Mic } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VoiceWorkspace } from "@/components/VoiceWorkspace";
import { AccountPanel } from "@/components/AccountPanel";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen">
      <header className="surface-hero relative overflow-hidden text-ink-foreground">
        <div className="pointer-events-none absolute -right-20 -top-24 size-96 rounded-full bg-lime/15 blur-3xl animate-drift" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="surface-warm flex size-9 items-center justify-center rounded-xl">
              <Mic className="size-4 text-coral-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Souty</span>
          </div>
          <Button variant="ghost" size="sm" className="text-ink-foreground hover:bg-white/10" onClick={signOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-6">
          <p className="text-xs tracking-[0.2em] text-ink-muted uppercase">Voice workspace</p>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Ahla, {user?.user_metadata?.["display_name"] ?? user?.email?.split("@")[0] ?? "friend"}.
          </h1>
          <p className="mt-3 max-w-xl text-ink-muted">
            Press the mic and talk however you talk — Derja, French or English. Souty answers back.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-10 grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-[1.6fr_1fr]">
        <VoiceWorkspace />
        {user && <AccountPanel user={user} />}
      </main>
    </div>
  );
}
