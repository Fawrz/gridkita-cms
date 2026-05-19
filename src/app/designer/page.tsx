import Link from "next/link";
import { ListTodo, CheckCircle2, Wallet, RotateCcw, ArrowRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/auth-mock";
import { ordersByDesigner } from "@/lib/mock/orders";
import { commissionByDesigner } from "@/lib/mock/finance";
import { packageById } from "@/lib/mock/catalog";
import { formatIDR, relativeTime } from "@/lib/format";

export default async function DesignerHome() {
  const me = await requireRole("DESIGNER");
  const all = ordersByDesigner(me.id);
  const todo = all.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  );
  const inRevision = all.filter((o) => o.status === "REVISION");
  const completed = all.filter((o) => o.status === "DELIVERED");

  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthEarnings = commissionByDesigner(me.id, period);
  const totalEarnings = commissionByDesigner(me.id);

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            Halo, {me.name.split(" ")[0]}
            <Palette className="size-8 text-primary inline-block" aria-hidden />
          </span>
        }
        description="Ringkasan pekerjaan & komisi Anda."
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="To-Do Aktif"
          value={todo.length}
          icon={ListTodo}
          tone="primary"
        />
        <StatCard
          label="Revisi"
          value={inRevision.length}
          icon={RotateCcw}
          tone="warning"
        />
        <StatCard
          label="Selesai"
          value={completed.length}
          icon={CheckCircle2}
          tone="success"
          hint="all-time"
        />
        <StatCard
          label="Komisi Bulan Ini"
          value={formatIDR(monthEarnings)}
          icon={Wallet}
          tone="success"
          hint={`Total all-time ${formatIDR(totalEarnings)}`}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-semibold">Tugas Aktif</h2>
              <p className="text-sm text-muted-foreground">
                Pesanan yang sedang Anda kerjakan
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/designer/tasks">Semua tugas</Link>
            </Button>
          </div>

          {todo.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Tidak ada tugas aktif. Selamat istirahat ✨
            </div>
          ) : (
            <ul className="divide-y">
              {todo.map((o) => {
                const pkg = o.servicePackageId ? packageById(o.servicePackageId) : null;
                return (
                  <li key={o.id}>
                    <Link
                      href={`/designer/tasks/${o.id}`}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {o.brief.projectName}
                          </span>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-3">
                          <span className="font-mono">{o.code}</span>
                          <span>{pkg?.name ?? "Custom"}</span>
                          <span>{relativeTime(o.updatedAt)}</span>
                          {o.revisionCount > 0 && (
                            <span className="text-warning">Revisi #{o.revisionCount}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                    </Link>
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
