import { requireRole } from "@/lib/session";
import { NotificationsList } from "@/app/dashboard/notifications/page";

export default async function AdminNotificationsPage() {
  const me = await requireRole("ADMIN");
  return <NotificationsList userId={me.id} />;
}
