import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, Mic, ShieldCheck, Waves } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Souty — Tunisian AI Voice Assistant in Derja" },
      {
        name: "description",
        content:
          "Souty is a premium AI voice assistant that understands Tunisian Derja, French and English. Speak naturally, get instant answers.",
      },
      { property: "og:title", content: "Souty — Tunisian AI Voice Assistant" },
      {
        property: "og:description",
        content: "Speak Derja, French or English. Souty listens, understands and answers instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Waves,
    title: "Natural Derja",
    body: "Arabizi, Arabic script or a French-Derja mix — Souty keeps up with how Tunisians actually speak.",
  },
  {
    icon: Globe2,
    title: "Three languages",
    body: "Switch between Derja, French and English mid-conversation. The reply always matches you.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Your conversations stay tied to your account, and the AI keys never leave the server.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="surface-warm flex size-9 items-center justify-center rounded-xl">
            <Mic className="size-4 text-coral-foreground" />
          </span>
          <span className="font-display text-lg font-semibold">Souty</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-8 pt-10">
          <div className="surface-hero relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-ink-foreground sm:px-16">
            <div className="pointer-events-none absolute -left-24 top-10 size-[26rem] rounded-full bg-coral/25 blur-3xl animate-drift" />
            <div className="pointer-events-none absolute -right-16 bottom-0 size-[22rem] rounded-full bg-lime/15 blur-3xl animate-drift" />
            <div className="relative max-w-2xl animate-rise">
              <span className="glass-ink inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs tracking-widest uppercase">
                <span className="size-1.5 rounded-full bg-lime" />
                Tunisian AI, live
              </span>
              <h1 className="mt-7 font-display text-5xl leading-[1.03] font-semibold sm:text-7xl">
                Hkili b<span className="text-lime">Derja</span>.
                <br />
                Souty yefhemek.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-ink-muted">
                A voice assistant built for Tunisia. Press the mic, talk the way you talk, and get a
                clear answer in the same language — Derja, French or English.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl px-7">
                  <Link to="/auth">
                    Start talking
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-xl px-7 text-ink-foreground hover:bg-white/10"
                >
                  <Link to="/auth">Create an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="glass-card rounded-3xl p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-accent">
                <feature.icon className="size-5 text-accent-foreground" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-12 text-xs text-muted-foreground">
        Souty · Made in Tunisia
      </footer>
    </div>
  );
}
