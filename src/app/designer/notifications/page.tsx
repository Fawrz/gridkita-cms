import { requireRole } from "@/lib/session";
import { NotificationsList } from "@/app/dashboard/notifications/page";

export default async function DesignerNotificationsPage() {
  const me = await requireRole("DESIGNER");
  return <NotificationsList userId={me.id} />;
}
