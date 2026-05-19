import { requireRole } from "@/lib/auth-mock";
import { NotificationsList } from "@/app/dashboard/notifications/page";

export default async function DesignerNotificationsPage() {
  const me = await requireRole("DESIGNER");
  return <NotificationsList userId={me.id} />;
}
