import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountPanel({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<string>("member");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const [profile, roles, messages] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (!active) return;
      setDisplayName(profile.data?.display_name ?? "");
      setRole(roles.data?.[0]?.role ?? "member");
      setCount(messages.count ?? 0);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [user.id]);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Could not save your name.");
    else toast.success("Profile updated.");
  }

  return (
    <aside className="glass-card animate-rise rounded-3xl p-6">
      <h2 className="font-display text-xl font-semibold">Your account</h2>

      {loading ? (
        <div className="mt-6 flex justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-3">
            <span className="surface-warm flex size-11 items-center justify-center rounded-2xl">
              <UserIcon className="size-5 text-coral-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName || "Souty user"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <ShieldCheck className="size-3.5" />
              {role === "admin" ? "Admin" : "Member"}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {count} saved {count === 1 ? "exchange" : "exchanges"}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should Souty call you?"
            />
            <Button className="mt-2 w-full rounded-xl" onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </div>

          {role === "admin" && (
            <p className="mt-6 rounded-2xl bg-secondary/70 p-3 text-xs text-muted-foreground">
              Admin access: you can review every member profile from the backend.
            </p>
          )}
        </>
      )}
    </aside>
  );
}
