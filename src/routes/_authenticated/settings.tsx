import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { changePassword, deleteAccount, updateDisplayName } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: "Settings — Souty" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleting, setDeleting] = useState(false);

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const { user: updated } = await updateDisplayName(name.trim());
      updateUser(updated);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your name.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      signOut();
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete your account.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <h1 className="font-display text-3xl font-semibold">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your Souty account.</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          <form onSubmit={handleSaveName} className="mt-5 space-y-2">
            <Label htmlFor="settings-name">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should Souty call you?"
              />
              <Button type="submit" disabled={savingName || !name.trim()}>
                {savingName && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
          <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            Signed in as {user?.role === "admin" ? "an admin" : "a member"}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the password you use to sign in.
          </p>
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword && <Loader2 className="size-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive">Danger zone</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your account and every saved conversation. This can't be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-4" disabled={deleting}>
                <Trash2 className="size-4" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account and every saved conversation. This can't
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteAccount}
                >
                  Delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>
    </div>
  );
}
