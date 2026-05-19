import { requireRole } from "@/lib/auth-mock";
import { DashboardShell, type NavGroup } from "@/components/dashboard-shell";
import { ordersByDesigner } from "@/lib/mock/orders";
import { unreadCount } from "@/lib/mock/notifications";

export default async function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole("DESIGNER");
  const myTasks = ordersByDesigner(me.id).filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  );

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
          badge: unreadCount(me.id) || undefined,
        },
        { href: "/designer/profile", label: "Profil", icon: "User" },
      ],
    },
  ];

  return (
    <DashboardShell
      groups={groups}
      me={me}
      unread={unreadCount(me.id)}
      notifLink="/designer/notifications"
      roleLabel="Designer"
    >
      {children}
    </DashboardShell>
  );
}
