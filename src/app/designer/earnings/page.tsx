import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/session";
import { commissionByDesigner, payoutsByDesigner, payoutBatches } from "@/lib/queries/finance";
import { allOrders } from "@/lib/queries/orders";
import { formatIDR, formatDate, periodLabel } from "@/lib/format";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";

export default async function DesignerEarningsPage() {
  const me = await requireRole("DESIGNER");
  const entries = await payoutsByDesigner(me.id);
  const accrued = entries.filter((e) => e.status === "ACCRUED");
  const paidOut = entries.filter((e) => e.status === "PAID_OUT");

  const totalAccrued = accrued.reduce((s, e) => s + e.commissionAmount, 0);
  const totalPaid = paidOut.reduce((s, e) => s + e.commissionAmount, 0);
  const total = totalAccrued + totalPaid;

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthEarnings = await commissionByDesigner(me.id, period);
  const allOrdersList = await allOrders();
  const batches = await payoutBatches();
  const orderMap = new Map(allOrdersList.map(o => [o.id, o]));

  return (
    <>
      <PageHeader
        title="Komisi Saya"
        description="Akumulasi komisi 70% dari setiap order yang Anda kerjakan."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Bulan Ini"
          value={formatIDR(monthEarnings)}
          hint={periodLabel(period)}
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Belum Dicairkan"
          value={formatIDR(totalAccrued)}
          icon={Wallet}
          tone="warning"
          hint={`${accrued.length} entri`}
        />
        <StatCard
          label="Sudah Dicairkan"
          value={formatIDR(totalPaid)}
          icon={CheckCircle2}
          tone="success"
          hint={`${paidOut.length} entri`}
        />
        <StatCard
          label="Total All-Time"
          value={formatIDR(total)}
          tone="info"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Riwayat Komisi</h2>
            <p className="text-sm text-muted-foreground">
              Setiap order yang DELIVERED otomatis mencatat komisi 70%.
            </p>
          </div>
          {entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada komisi tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium text-right">Order Total</th>
                    <th className="px-4 py-3 font-medium text-right">Komisi (70%)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((e) => {
                    const order = orderMap.get(e.orderId);
                    const batch = e.payoutBatchId
                      ? batches.find((b) => b.id === e.payoutBatchId)
                      : null;
                    return (
                      <tr key={e.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">{formatDate(e.accruedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs">{order?.code}</div>
                          <div className="text-muted-foreground text-xs">
                            {order?.brief.projectName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatIDR(e.orderTotal)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary">
                          {formatIDR(e.commissionAmount)}
                        </td>
                        <td className="px-4 py-3">
                          {e.status === "PAID_OUT" ? (
                            <Badge className="bg-success text-success-foreground">
                              Dicairkan
                            </Badge>
                          ) : (
                            <Badge variant="outline">Belum dicairkan</Badge>
                          )}
                          {batch && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {periodLabel(batch.periodMonth)}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
