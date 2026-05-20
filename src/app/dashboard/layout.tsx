import { requireRole } from "@/lib/session";
import { DashboardShell, type NavGroup } from "@/components/dashboard-shell";
import { ordersByClient } from "@/lib/queries/orders";
import { unreadCount } from "@/lib/queries/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole("CLIENT");
  const myOrders = await ordersByClient(me.id);
  const activeOrders = myOrders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;
  const unread = await unreadCount(me.id);

  const groups: NavGroup[] = [
    {
      label: "Beranda",
      items: [
        { href: "/dashboard", label: "Ringkasan", icon: "LayoutDashboard" },
      ],
    },
    {
      label: "Pesanan",
      items: [
        {
          href: "/dashboard/orders",
          label: "Pesanan Saya",
          icon: "ShoppingBag",
          badge: activeOrders > 0 ? activeOrders : undefined,
        },
        {
          href: "/dashboard/orders/new",
          label: "Pesan Baru",
          icon: "Sparkles",
        },
      ],
    },
  ];

  return (
    <DashboardShell
      groups={groups}
      me={me}
      unread={unread}
      notifLink="/dashboard/notifications"
      profileLink="/dashboard/profile"
      settingsLink="/dashboard/profile"
      roleLabel="Klien"
    >
      {children}
    </DashboardShell>
  );
}
