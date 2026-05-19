import { requireRole } from "@/lib/auth-mock";
import { NotificationsList } from "@/app/dashboard/notifications/page";

export default async function AdminNotificationsPage() {
  const me = await requireRole("ADMIN");
  return <NotificationsList userId={me.id} />;
}
