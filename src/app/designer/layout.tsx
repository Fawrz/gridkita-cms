import { requireRole } from "@/lib/session";
import { DashboardShell, type NavGroup } from "@/components/dashboard-shell";
import { ordersByDesigner } from "@/lib/queries/orders";
import { unreadCount } from "@/lib/queries/notifications";

export default async function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole("DESIGNER");
  const myTasks = (await ordersByDesigner(me.id)).filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  );
  const unread = await unreadCount(me.id);

  const groups: NavGroup[] = [
    {
      label: "Beranda",
      items: [{ href: "/designer", label: "Ringkasan", icon: "LayoutDashboard" }],
    },
    {
      label: "Pekerjaan",
      items: [
        {
          href: "/designer/tasks",
          label: "To-Do List",
          icon: "ListTodo",
          badge: myTasks.length || undefined,
        },
        { href: "/designer/earnings", label: "Komisi", icon: "Wallet" },
      ],
    },
    {
      label: "Akun",
      items: [
        {
          href: "/designer/notifications",
          label: "Notifikasi",
          icon: "Bell",
          badge: unread || undefined,
        },
        { href: "/designer/profile", label: "Profil", icon: "User" },
      ],
    },
  ];

  return (
    <DashboardShell
      groups={groups}
      me={me}
      unread={unread}
      notifLink="/designer/notifications"
      roleLabel="Designer"
    >
      {children}
    </DashboardShell>
  );
}
