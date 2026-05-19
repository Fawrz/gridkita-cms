import { requireRole } from "@/lib/auth-mock";
import { DashboardShell, type NavGroup } from "@/components/dashboard-shell";
import { orders, payments } from "@/lib/mock/orders";
import { unreadCount } from "@/lib/mock/notifications";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireRole("ADMIN");
  const needsAction = orders.filter((o) => ["WAITING_VERIFICATION", "PAID", "QUOTE_REQUESTED", "DONE"].includes(o.status)).length;
  const waitingPayments = payments.filter((p) => p.status === "WAITING").length;
  const quotes = orders.filter((o) => o.status === "QUOTE_REQUESTED").length;

  const groups: NavGroup[] = [
    { label: "Manajemen", items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/admin/orders", label: "Pesanan", icon: "ShoppingCart", badge: needsAction || undefined },
      { href: "/admin/payments", label: "Pembayaran", icon: "CreditCard", badge: waitingPayments || undefined },
      { href: "/admin/quotes", label: "Custom Quote", icon: "FileQuestion", badge: quotes || undefined },
    ]},
    { label: "CMS", items: [
      { href: "/admin/portfolio", label: "Portofolio", icon: "Images" },
      { href: "/admin/catalog", label: "Katalog", icon: "Package" },
      { href: "/admin/users", label: "Users", icon: "Users" },
    ]},
    { label: "Keuangan", items: [
      { href: "/admin/payroll", label: "Payroll", icon: "Wallet" },
      { href: "/admin/cashflow", label: "Cashflow", icon: "ReceiptText" },
      { href: "/admin/recurring", label: "Recurring", icon: "Repeat" },
      { href: "/admin/reports", label: "Reports", icon: "BarChart3" },
    ]},
    { label: "Sistem", items: [
      { href: "/admin/notifications", label: "Notifikasi", icon: "Bell", badge: unreadCount(me.id) || undefined },
      { href: "/admin/settings", label: "Settings", icon: "Settings" },
    ]},
  ];

  return (
    <DashboardShell groups={groups} me={me} unread={unreadCount(me.id)} notifLink="/admin/notifications" roleLabel="Admin" showThemeToggle>
      {children}
    </DashboardShell>
  );
}
