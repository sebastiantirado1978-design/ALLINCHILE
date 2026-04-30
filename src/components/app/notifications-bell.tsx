"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { cn, formatRelative } from "@/lib/utils";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/server/actions/notifications";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationsBell({
  initialNotifications,
  initialUnread,
}: {
  initialNotifications: Notification[];
  initialUnread: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function markOne(id: string, link?: string | null) {
    // Optimistic
    setNotifs((prev) => prev.map((n) => (n.id === id && !n.is_read ? { ...n, is_read: true } : n)));
    setUnread((c) => Math.max(0, c - (notifs.find((n) => n.id === id)?.is_read ? 0 : 1)));
    start(async () => {
      const res = await markNotificationReadAction(id);
      if (res?.error) toast.error(res.error);
    });
    if (link) {
      setOpen(false);
      router.push(link);
    }
  }

  function markAll() {
    if (unread === 0) return;
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    start(async () => {
      const res = await markAllNotificationsReadAction();
      if (res?.error) toast.error(res.error);
      else toast.success("Todas marcadas como leídas");
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => setOpen((o) => !o)}
        className="h-10 w-10 rounded-md hover:bg-[var(--muted)] flex items-center justify-center relative"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-[var(--border)] shadow-lg overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
            <p className="text-sm font-semibold">Notificaciones</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={pending}
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[var(--muted-foreground)] text-center">
              Sin notificaciones aún
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifs.map((n) => (
                <li key={n.id} className="border-b border-[var(--border)] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => markOne(n.id, n.link_url)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-[var(--muted)] flex items-start gap-3",
                      !n.is_read && "bg-cyan-50/50",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full mt-1.5 shrink-0",
                        n.is_read ? "bg-transparent" : "bg-[var(--accent)]",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !n.is_read && "font-semibold")}>{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                          {n.body}
                        </p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {formatRelative(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && <Check className="h-4 w-4 text-[var(--muted-foreground)] mt-1 shrink-0 opacity-0 group-hover:opacity-100" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
