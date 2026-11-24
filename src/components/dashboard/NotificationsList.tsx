import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { BellOff, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useNotifications } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { notificationsQueryOptions, type AppNotification } from "@/lib/account";
import { safeRedirect } from "@/lib/auth-schemas";
import { cn } from "@/lib/utils";

export function NotificationsList({ limit, compact = false }: { limit?: number; compact?: boolean }) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useNotifications();
  const key = notificationsQueryOptions(user.id).queryKey;

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: () => toast.error("Couldn't update notifications. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: () => toast.error("Couldn't delete the notification. Please try again."),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: limit ?? 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <p className="text-sm text-destructive">We couldn't load your notifications.</p>;
  }

  const items = limit ? (data ?? []).slice(0, limit) : (data ?? []);
  const unreadIds = (data ?? []).filter((n) => !n.read_at).map((n) => n.id);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
        <BellOff className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-medium text-navy">You're all caught up</p>
        <p className="mt-1 text-sm text-muted-foreground">New updates about your account will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {!compact && unreadIds.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => markRead.mutate(unreadIds)} disabled={markRead.isPending}>
            <Check />
            Mark all as read
          </Button>
        </div>
      )}
      <ul className="space-y-3">
        {items.map((n) => (
          <NotificationItem
            key={n.id}
            n={n}
            compact={compact}
            onRead={() => markRead.mutate([n.id])}
            onDelete={() => remove.mutate(n.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function NotificationItem({
  n,
  compact,
  onRead,
  onDelete,
}: {
  n: AppNotification;
  compact: boolean;
  onRead: () => void;
  onDelete: () => void;
}) {
  const unread = !n.read_at;
  const link = safeRedirect(n.link);
  const navigate = useNavigate();
  return (
    <li
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-4 transition-colors",
        unread && "border-teal/40 bg-teal-soft/40",
      )}
    >
      <span
        className={cn("mt-1.5 size-2 shrink-0 rounded-full", unread ? "bg-teal" : "bg-transparent")}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy">
          {n.title}
          {unread && <span className="sr-only"> (unread)</span>}
        </p>
        {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={n.created_at}>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</time>
          {link && (
            <button
              type="button"
              onClick={() => {
                if (unread) onRead();
                void navigate({ href: link });
              }}
              className="font-semibold text-teal hover:underline"
            >
              Open
            </button>
          )}
        </div>
      </div>
      {!compact && (
        <div className="flex shrink-0 items-start gap-1">
          {unread && (
            <Button variant="ghost" size="icon" onClick={onRead} aria-label={`Mark "${n.title}" as read`}>
              <Check />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label={`Delete "${n.title}"`}>
            <Trash2 />
          </Button>
        </div>
      )}
    </li>
  );
}
