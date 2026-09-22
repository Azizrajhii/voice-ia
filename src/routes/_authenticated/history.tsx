import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { clearMessages, getMessages, type ConversationMessage } from "@/lib/api";
import { dayLabel } from "@/lib/dates";
import { Button } from "@/components/ui/button";
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

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [{ title: "Conversation History — Souty" }],
  }),
  component: HistoryPage,
});

const PAGE_SIZE = 20;
const LANGUAGE_LABEL: Record<ConversationMessage["language"], string> = {
  derja: "Derja",
  french: "Français",
  english: "English",
};

function HistoryPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async (offset: number) => {
    const { messages: page } = await getMessages(PAGE_SIZE, offset);
    setHasMore(page.length === PAGE_SIZE);
    return page;
  }, []);

  useEffect(() => {
    load(0)
      .then(setMessages)
      .catch(() => toast.error("Could not load your conversation history."))
      .finally(() => setLoading(false));
  }, [load]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const page = await load(messages.length);
      setMessages((prev) => [...prev, ...page]);
    } catch {
      toast.error("Could not load more conversations.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    try {
      await clearMessages();
      setMessages([]);
      setHasMore(false);
      toast.success("Conversation history cleared.");
    } catch {
      toast.error("Could not clear history.");
    } finally {
      setClearing(false);
    }
  }

  let lastDay = "";

  return (
    <div>
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-10">
          <div>
            <h1 className="font-display text-3xl font-semibold">Conversation history</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every exchange you've had with Souty, saved to your account.
            </p>
          </div>
          {messages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={clearing}>
                  <Trash2 className="size-4" />
                  Clear history
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear your conversation history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes every saved exchange. This can't be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear}>Clear history</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-card flex flex-col items-center rounded-3xl p-12 text-center">
            <span className="surface-warm flex size-12 items-center justify-center rounded-2xl">
              <MessageCircle className="size-5 text-coral-foreground" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold">No conversations yet</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Once you talk with Souty, every exchange shows up here.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link to="/dashboard">Go talk to Souty</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {messages.map((message) => {
              const label = dayLabel(message.created_at);
              const showDayHeading = label !== lastDay;
              lastDay = label;
              return (
                <div key={message.id}>
                  {showDayHeading && (
                    <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                      {label}
                    </p>
                  )}
                  <div className="glass-card animate-rise space-y-3 rounded-2xl p-5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                        {LANGUAGE_LABEL[message.language]}
                      </span>
                      <time dateTime={message.created_at}>{format(new Date(message.created_at), "p")}</time>
                    </div>
                    <p className="surface-warm w-fit max-w-full rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed text-coral-foreground">
                      {message.transcript}
                    </p>
                    <p className="ml-auto w-fit max-w-full rounded-2xl rounded-bl-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-ink-foreground">
                      {message.reply}
                    </p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
