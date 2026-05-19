import { requireRole } from "@/lib/auth-mock";
import { DashboardShell, type NavGroup } from "@/components/dashboard-shell";
import { ordersByClient } from "@/lib/mock/orders";
import { unreadCount } from "@/lib/mock/notifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireRole("CLIENT");
  const myOrders = ordersByClient(me.id);
  const activeOrders = myOrders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  ).length;

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
    {
      label: "Akun",
      items: [
        {
          href: "/dashboard/notifications",
          label: "Notifikasi",
          icon: "Bell",
          badge: unreadCount(me.id) || undefined,
        },
        { href: "/dashboard/profile", label: "Profil", icon: "User" },
      ],
    },
  ];

  return (
    <DashboardShell
      groups={groups}
      me={me}
      unread={unreadCount(me.id)}
      notifLink="/dashboard/notifications"
      roleLabel="Klien"
    >
      {children}
    </DashboardShell>
  );
}
