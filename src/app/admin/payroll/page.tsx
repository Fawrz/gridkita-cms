import { redirect } from "next/navigation";
import { Banknote, CheckCircle2, Clock, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/session";
import {
  payrollEntries,
  payoutBatches,
  commissionByDesigner,
} from "@/lib/queries/finance";
import { allOrders } from "@/lib/queries/orders";
import { activeDesigners, allUsers } from "@/lib/queries/users";
import { formatIDR, formatDate, formatDateTime, periodLabel } from "@/lib/format";

export default async function AdminPayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireRole("ADMIN");
  const { period = "2026-03" } = await searchParams;

  async function processBatch() {
    "use server";
    redirect("/admin/payroll?period=" + new Date().toISOString().slice(0, 7));
  }

  const [entriesList, designersList, ordersList, usersList, batchesList] = await Promise.all([
    payrollEntries(),
    activeDesigners(),
    allOrders(),
    allUsers(),
    payoutBatches(),
  ]);
  const accrued = entriesList.filter((e) => e.status === "ACCRUED");
  const paidOut = entriesList.filter((e) => e.status === "PAID_OUT");
  const totalAccrued = accrued.reduce((s, e) => s + e.commissionAmount, 0);
  const totalPaid = paidOut.reduce((s, e) => s + e.commissionAmount, 0);

  // Per-designer summary
  const commissionPromises = designersList.map(d => commissionByDesigner(d.id));
  const commissions = await Promise.all(commissionPromises);
  const designerSummary = designersList.map((d, i) => {
    const entries = entriesList.filter((e) => e.designerId === d.id);
    const unpaid = entries.filter((e) => e.status === "ACCRUED");
    return {
      designer: d,
      unpaidCount: unpaid.length,
      unpaidAmount: unpaid.reduce((s, e) => s + e.commissionAmount, 0),
      totalAmount: commissions[i],
    };
  });
  const orderMap = new Map(ordersList.map(o => [o.id, o]));
  const userMap = new Map(usersList.map(u => [u.id, u]));

  const PERIODS = ["2026-03", "2026-02", "2026-01"];

  return (
    <>
      <PageHeader
        title="Payroll Desainer"
        description="Rekap komisi 70% otomatis per desainer. Proses batch payout sekaligus."
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Belum Dicairkan"
          value={formatIDR(totalAccrued)}
          icon={Clock}
          tone="warning"
          hint={`${accrued.length} entri`}
          className="col-span-2 xl:col-span-2"
        />
        <StatCard
          label="Sudah Dicairkan"
          value={formatIDR(totalPaid)}
          icon={CheckCircle2}
          tone="success"
          hint={`${paidOut.length} entri`}
        />
        <StatCard
          label="Desainer Aktif"
          value={designersList.length}
          icon={Users2}
          tone="primary"
        />
        <StatCard
          label="Total All-Time"
          value={formatIDR(totalAccrued + totalPaid)}
          icon={Banknote}
          className="col-span-2 xl:col-span-2"
        />
      </div>

      {/* Per-designer summary */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-5 border-b flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-semibold">Ringkasan Per Desainer</h2>
              <p className="text-sm text-muted-foreground">
                Komisi belum dicairkan & siap dibayar.
              </p>
            </div>
            {accrued.length > 0 && (
              <form action={processBatch}>
                <Button type="submit">
                  <Banknote className="size-4 mr-1.5" />
                  Proses Payout Batch ({formatIDR(totalAccrued)})
                </Button>
              </form>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Desainer</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Rekening</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Belum Cair</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Total All-Time</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {designerSummary.map(({ designer, unpaidCount, unpaidAmount, totalAmount }) => (
                  <tr key={designer.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{designer.name}</div>
                      <div className="text-xs text-muted-foreground">{designer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {designer.bankAccount ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold tabular-nums text-warning">
                        {formatIDR(unpaidAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">{unpaidCount} entri</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatIDR(totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      {unpaidAmount > 0 ? (
                        <Badge variant="outline" className="bg-warning/15 border-warning/40">
                          Belum dibayar
                        </Badge>
                      ) : (
                        <Badge className="bg-success text-success-foreground">Lunas</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll detail per period */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-5 border-b flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold flex-1">Detail Entri Komisi</h2>
            <div className="flex gap-1 flex-wrap">
              {PERIODS.map((p) => (
                <form key={p} action={processBatch}>
                  <button
                    name="period"
                    value={p}
                    type="submit"
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      period === p
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "hover:bg-muted"
                    }`}
                  >
                    {periodLabel(p)}
                  </button>
                </form>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left border-b border-border">
                <tr>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tanggal</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Desainer</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Order</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Order Total</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Komisi (70%)</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Kas (30%)</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entriesList.map((e) => {
                  const d = userMap.get(e.designerId);
                  const o = orderMap.get(e.orderId);
                  return (
                    <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">{formatDate(e.accruedAt)}</td>
                      <td className="px-4 py-3 font-medium">{d?.name}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs">{o?.code}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {o?.brief.projectName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatIDR(e.orderTotal)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary">
                        {formatIDR(e.commissionAmount)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatIDR(e.companyShare)}
                      </td>
                      <td className="px-4 py-3">
                        {e.status === "PAID_OUT" ? (
                          <Badge className="bg-success text-success-foreground">Dicairkan</Badge>
                        ) : (
                          <Badge variant="outline">Accrued</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payout batch history */}
      <Card>
        <CardContent className="p-0">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Riwayat Batch Payout</h2>
          </div>
          {batchesList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Belum ada batch.</div>
          ) : (
            <ul className="divide-y">
              {batchesList.map((b) => {
                const processor = userMap.get(b.processedById);
                return (
                  <li key={b.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold">{periodLabel(b.periodMonth)}</div>
                      <div className="text-sm text-muted-foreground">
                        {b.entryIds.length} entri · diproses {formatDateTime(b.processedAt)} oleh{" "}
                        {processor?.name}
                      </div>
                      {b.note && (
                        <div className="text-xs text-muted-foreground italic">{b.note}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold tabular-nums">
                        {formatIDR(b.totalAmount)}
                      </div>
                      <Badge className="bg-success text-success-foreground">Lunas</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
