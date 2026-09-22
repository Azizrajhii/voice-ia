import { Link, useNavigate } from "@tanstack/react-router";
import { History, LogOut, Mic, Settings, ShieldCheck, Waves } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLIENT_LINKS = [
  { to: "/dashboard", label: "Workspace", icon: Waves },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const ADMIN_LINK = { to: "/admin", label: "Admin", icon: ShieldCheck } as const;

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate({ to: "/auth" });
  }

  const links = user?.role === "admin" ? [...CLIENT_LINKS, ADMIN_LINK] : CLIENT_LINKS;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5">
          <span className="surface-warm flex size-8 items-center justify-center rounded-lg">
            <Mic className="size-3.5 text-coral-foreground" />
          </span>
          <span className="font-display text-base font-semibold">Souty</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-3.5",
                link.to === "/admin" && "text-primary",
              )}
              activeProps={{ className: "!bg-secondary !text-foreground" }}
              activeOptions={{ exact: true }}
            >
              <link.icon className="size-4" />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="sm" className="shrink-0" onClick={handleSignOut}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
