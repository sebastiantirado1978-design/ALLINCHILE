import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { getCurrentUser, getCurrentOrg } from "@/server/queries/me";
import { listNotifications, unreadNotificationsCount } from "@/server/queries/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const org = await getCurrentOrg();

  const [notifications, unreadCount] = org
    ? await Promise.all([
        listNotifications(org.id, 15),
        unreadNotificationsCount(org.id),
      ])
    : [[], 0];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar orgName={org?.name ?? "Sin organización"} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={{ full_name: user.full_name, email: user.email }}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
