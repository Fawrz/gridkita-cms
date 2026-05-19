import { requireRole } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { FinanceLineChart, DesignerBarChart, FunnelBarChart, ExpensePieChart } from "@/components/charts/admin-charts";
import {
  monthlyFinance,
  expenseBreakdown,
  designerRanking,
  orderFunnel,
} from "@/lib/queries/analytics";
import { cashFlows, payrollEntries } from "@/lib/queries/finance";
import { allOrders } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/format";
import { TrendingUp, TrendingDown, Percent, Target } from "lucide-react";

export default async function AdminReportsPage() {
  await requireRole("ADMIN");

  const [cashFlowsList, payrollEntriesList, ordersList, financeData, expenseData, rankingData, funnelData] = await Promise.all([
    cashFlows(),
    payrollEntries(),
    allOrders(),
    monthlyFinance(),
    expenseBreakdown(),
    designerRanking(),
    orderFunnel(),
  ]);

  const revenue = cashFlowsList
    .filter((c: { source: string; amount: number }) => c.source === "ORDER_PAYMENT")
    .reduce((s: number, c) => s + c.amount, 0);
  const expense = cashFlowsList
    .filter((c: { type: string; amount: number }) => c.type === "EXPENSE")
    .reduce((s: number, c) => s + c.amount, 0);
  const profit = revenue - expense;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;

  const totalOrders = ordersList.length;
  const deliveredOrders = ordersList.filter((o) => o.status === "DELIVERED").length;
  const conversionRate =
    totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  // Monthly P&L table
  const months = ["2026-01", "2026-02", "2026-03"];
  const pnlRows = months.map((m) => {
    const shortMonth = new Date(m + "-01").toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    const inc = cashFlowsList
      .filter((c) => c.occurredAt.startsWith(m) && c.type === "INCOME" && c.source === "ORDER_PAYMENT")
      .reduce((s: number, c) => s + c.amount, 0);
    const exp = cashFlowsList
      .filter((c) => c.occurredAt.startsWith(m) && c.type === "EXPENSE")
      .reduce((s: number, c) => s + c.amount, 0);
    const payrollPaid = payrollEntriesList
      .filter((e) => e.accruedAt.startsWith(m))
      .reduce((s: number, e) => s + e.commissionAmount, 0);
    return {
      month: shortMonth,
      revenue: inc,
      expense: exp,
      payroll: payrollPaid,
      net: inc - exp - payrollPaid,
    };
  });

  return (
    <>
      <PageHeader
        title="Laporan Keuangan"
        description="Laba/rugi bulanan, tren cashflow, dan analisis operasional GridKita."
      />

      {/* KPI row */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={formatIDR(revenue)} icon={TrendingUp} tone="success" trend={{ value: 18, positive: true }} />
        <StatCard label="Total Pengeluaran" value={formatIDR(expense)} icon={TrendingDown} tone="warning" />
        <StatCard label="Net Profit" value={formatIDR(profit)} icon={Percent} tone={profit >= 0 ? "primary" : "default"} hint={`Margin ${margin}%`} />
        <StatCard label="Konversi Order" value={`${conversionRate}%`} icon={Target} tone="info" hint={`${deliveredOrders}/${totalOrders} delivered`} />
      </div>

      {/* P&L table */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Laba / Rugi Bulanan</h2>
            <p className="text-sm text-muted-foreground">
              Revenue, pengeluaran, payroll, dan net profit per bulan.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Periode</th>
                  <th className="px-4 py-3 font-medium text-right">Revenue</th>
                  <th className="px-4 py-3 font-medium text-right">Pengeluaran</th>
                  <th className="px-4 py-3 font-medium text-right">Payroll</th>
                  <th className="px-4 py-3 font-medium text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pnlRows.map((row) => (
                  <tr key={row.month} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{row.month}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-success">
                      {formatIDR(row.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-destructive">
                      {formatIDR(row.expense)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-warning">
                      {formatIDR(row.payroll)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        row.net >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {formatIDR(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/40 font-semibold">
                <tr>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums text-success">
                    {formatIDR(pnlRows.reduce((s, r) => s + r.revenue, 0))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-destructive">
                    {formatIDR(pnlRows.reduce((s, r) => s + r.expense, 0))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-warning">
                    {formatIDR(pnlRows.reduce((s, r) => s + r.payroll, 0))}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatIDR(pnlRows.reduce((s, r) => s + r.net, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts grid */}
      <div className="grid xl:grid-cols-2 gap-4">
        <FinanceLineChart data={financeData} />
        <ExpensePieChart data={expenseData} />
        <DesignerBarChart data={rankingData} />
        <FunnelBarChart data={funnelData} />
      </div>
    </>
  );
}
