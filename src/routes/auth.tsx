import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Mic } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Souty — Tunisian AI Voice Assistant" },
      {
        name: "description",
        content:
          "Log in or create your Souty account to talk with a Tunisian AI voice assistant in Derja, French or English.",
      },
      { property: "og:title", content: "Sign in to Souty" },
      {
        property: "og:description",
        content: "Access your Souty voice workspace and talk in Derja, French or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(name, email, password);
        toast.success("Account created. Welcome to Souty.");
      } else {
        await signIn(email, password);
        toast.success("Welcome back to Souty.");
      }
      navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="surface-hero relative hidden overflow-hidden p-12 text-ink-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-1/3 size-[28rem] rounded-full bg-coral/25 blur-3xl animate-drift" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="surface-warm flex size-10 items-center justify-center rounded-2xl">
            <Mic className="size-5 text-coral-foreground" />
          </span>
          <span className="font-display text-xl font-semibold">Souty</span>
        </Link>
        <div className="relative max-w-md">
          <h1 className="font-display text-5xl leading-[1.05] font-semibold">
            Your voice.
            <br />
            <span className="text-lime">Your Derja.</span>
            <br />
            Understood.
          </h1>
          <p className="mt-6 text-base text-ink-muted">
            Speak naturally in Tunisian Derja, French or English. Souty listens, understands and
            answers in the same breath.
          </p>
        </div>
        <p className="relative text-xs tracking-widest text-ink-muted uppercase">
          Made in Tunisia · Built for the world
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm animate-rise">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="surface-warm flex size-9 items-center justify-center rounded-xl">
              <Mic className="size-4 text-coral-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Souty</span>
          </Link>
          <h2 className="font-display text-3xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to open your voice workspace."
              : "A few seconds and Souty is listening."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aziz"
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Souty?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
