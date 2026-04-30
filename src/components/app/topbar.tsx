"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/app/global-search";
import { NotificationsBell } from "@/components/app/notifications-bell";
import { initials } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

export function Topbar({
  user,
  notifications,
  unreadCount,
}: {
  user: { full_name?: string | null; email: string };
  notifications: Notification[];
  unreadCount: number;
}) {
  const name = user.full_name || user.email;
  return (
    <header className="h-16 shrink-0 bg-white border-b border-[var(--border)] flex items-center px-6 gap-4 sticky top-0 z-20">
      <GlobalSearch />

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Nuevo
        </Button>
        <NotificationsBell initialNotifications={notifications} initialUnread={unreadCount} />
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
          <div className="h-8 w-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
            {initials(name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs text-[var(--muted-foreground)] leading-tight">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
