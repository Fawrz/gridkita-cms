import Link from "next/link";
import { ShoppingCart, CreditCard, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { allOrders } from "@/lib/queries/orders";
import { allUsers } from "@/lib/queries/users";
import { packages } from "@/lib/queries/catalog";
import { formatIDR, relativeTime } from "@/lib/format";
import { adminKpis, monthlyFinance, expenseBreakdown, designerRanking, orderFunnel } from "@/lib/queries/analytics";
import { DesignerBarChart, ExpensePieChart, FinanceLineChart, FunnelBarChart } from "@/components/charts/admin-charts";

export default async function AdminHomePage() {
  const [ordersList, usersList, packagesList, kpis, finance, expenses, ranking, funnel] = await Promise.all([
    allOrders(),
    allUsers(),
    packages(),
    adminKpis(),
    monthlyFinance(),
    expenseBreakdown(),
    designerRanking(),
    orderFunnel(),
  ]);
  const userMap = new Map(usersList.map((u) => [u.id, u]));
  const packageMap = new Map(packagesList.map((p) => [p.id, p]));
  const needsAction = ordersList
    .filter((o) => ["WAITING_VERIFICATION", "PAID", "QUOTE_REQUESTED", "DONE"].includes(o.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Pantau operasional, order, cashflow, dan performa desainer GridKita."
        actions={<Button asChild><Link href="/admin/orders">Kelola order <ArrowRight className="ml-1 size-4" /></Link></Button>}
      />

      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4 mb-6">
        <StatCard label="Revenue Delivered" value={formatIDR(kpis.revenue)} icon={TrendingUp} tone="success" trend={{ value: 18, positive: true }} className="col-span-2 xl:col-span-2" />
        <StatCard label="Order Aktif" value={kpis.activeOrders} icon={ShoppingCart} tone="primary" hint="butuh monitoring" />
        <StatCard label="Verifikasi Bayar" value={kpis.waitingPayments} icon={CreditCard} tone="warning" hint="menunggu admin" />
        <StatCard label="Payroll Accrued" value={formatIDR(kpis.accruedPayroll)} icon={Wallet} tone="info" className="col-span-2 xl:col-span-2" />
      </div>

      <div className="grid xl:grid-cols-2 gap-4 mb-6">
        <FinanceLineChart data={finance} />
        <ExpensePieChart data={expenses} />
        <DesignerBarChart data={ranking} />
        <FunnelBarChart data={funnel} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-5 border-b flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Butuh Tindakan</h2>
              <p className="text-sm text-muted-foreground">Order yang perlu diverifikasi, di-assign, di-quote, atau dikonfirmasi.</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/admin/orders">Semua order</Link></Button>
          </div>
          <ul className="divide-y">
            {needsAction.map((o: { id: string; clientId: string; servicePackageId?: string | null; brief: { projectName: string }; status: string; code: string; updatedAt: string; finalPrice: number }) => {
              const client = userMap.get(o.clientId);
              const pkg = o.servicePackageId ? packageMap.get(o.servicePackageId) : null;
              return (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{o.brief.projectName}</span>
                        <OrderStatusBadge status={o.status as "DELIVERED" | "CANCELLED" | "DONE" | "IN_PROGRESS" | "REVISION" | "ASSIGNED" | "PAID" | "PENDING_PAYMENT" | "QUOTE_REQUESTED" | "QUOTE_OFFERED" | "WAITING_VERIFICATION"} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-3">
                        <span className="font-mono">{o.code}</span>
                        <span>{client?.name}</span>
                        <span>{pkg?.name ?? "Custom"}</span>
                        <span>{relativeTime(o.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold tabular-nums">{o.finalPrice ? formatIDR(o.finalPrice) : "Quote"}</div>
                      <ArrowRight className="size-4 text-muted-foreground inline-block" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
