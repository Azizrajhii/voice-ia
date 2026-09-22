import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Loader2, MessageSquare, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  adminDeleteUser,
  getAdminOverview,
  getAdminUsers,
  setUserRole,
  type AdminOverview,
  type AdminUser,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Souty" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, user, navigate]);

  const load = useCallback(async () => {
    const [overviewData, usersData] = await Promise.all([getAdminOverview(), getAdminUsers()]);
    setOverview(overviewData);
    setUsers(usersData.users);
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    load()
      .catch(() => toast.error("Could not load admin data."))
      .finally(() => setLoading(false));
  }, [user, load]);

  async function handleToggleRole(target: AdminUser) {
    const nextRole = target.role === "admin" ? "user" : "admin";
    setBusyId(target.id);
    try {
      await setUserRole(target.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u)));
      toast.success(`${target.name} is now ${nextRole === "admin" ? "an admin" : "a member"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update role.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(target: AdminUser) {
    setBusyId(target.id);
    try {
      await adminDeleteUser(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast.success(`${target.name}'s account was deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete user.");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || user?.role !== "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="font-display text-3xl font-semibold">Admin</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage every Souty account. This area is only visible to admins.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={Users} label="Total users" value={overview?.userCount ?? 0} />
              <StatCard
                icon={MessageSquare}
                label="Total conversations"
                value={overview?.messageCount ?? 0}
              />
              <StatCard
                icon={MessageSquare}
                label="Conversations today"
                value={overview?.messagesToday ?? 0}
              />
            </div>

            <section className="glass-card rounded-3xl p-6">
              <h2 className="font-display text-lg font-semibold">Users</h2>
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Exchanges</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf = u.id === user.id;
                      const busy = busyId === u.id;
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.name}
                            {isSelf && (
                              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <span
                              className={
                                u.role === "admin"
                                  ? "rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                                  : "rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                              }
                            >
                              {u.role === "admin" ? "Admin" : "Member"}
                            </span>
                          </TableCell>
                          <TableCell>{u.message_count}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(u.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSelf || busy}
                                onClick={() => handleToggleRole(u)}
                              >
                                {u.role === "admin" ? "Demote" : "Promote"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" disabled={isSelf || busy}>
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {u.name}'s account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This permanently deletes their account and every saved
                                      conversation. This can't be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(u)}
                                    >
                                      Delete account
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-card flex items-center gap-4 rounded-3xl p-5">
      <span className="surface-warm flex size-11 items-center justify-center rounded-2xl">
        <Icon className="size-5 text-coral-foreground" />
      </span>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
