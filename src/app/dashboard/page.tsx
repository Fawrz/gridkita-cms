import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowRight,
  HandMetal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { requireRole } from "@/lib/session";
import { ordersByClient } from "@/lib/queries/orders";
import { packages } from "@/lib/queries/catalog";
import { formatIDR, relativeTime } from "@/lib/format";

export default async function ClientHome() {
  const me = await requireRole("CLIENT");
  const myOrders = await ordersByClient(me.id);
  const allPackages = await packages();
  const packageMap = new Map(allPackages.map(p => [p.id, p]));
  const active = myOrders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  );
  const completed = myOrders.filter((o) => o.status === "DELIVERED");
  const totalSpent = completed.reduce((s, o) => s + o.finalPrice, 0);
  const recent = [...myOrders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            Halo, {me.name.split(" ")[0]}
            <HandMetal className="size-8 text-warning inline-block" aria-hidden />
          </span>
        }
        description="Ini ringkasan pesanan Anda di GridKita."
        actions={
          <Button asChild>
            <Link href="/dashboard/orders/new">
              Pesan baru <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Pesanan Aktif"
          value={active.length}
          icon={Clock}
          tone="primary"
          hint="sedang diproses"
        />
        <StatCard
          label="Selesai"
          value={completed.length}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Total Pesanan"
          value={myOrders.length}
          icon={ShoppingBag}
        />
        <StatCard
          label="Total Belanja"
          value={formatIDR(totalSpent)}
          icon={Wallet}
          tone="info"
          hint="seluruh pesanan selesai"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-semibold">Pesanan Terbaru</h2>
              <p className="text-sm text-muted-foreground">5 pesanan terakhir Anda</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/orders">Semua pesanan</Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Belum ada pesanan.</p>
              <Button asChild>
                <Link href="/dashboard/orders/new">Buat pesanan pertama</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recent.map((o) => {
                const pkg = o.servicePackageId ? packageMap.get(o.servicePackageId) : null;
                return (
                  <li key={o.id}>
                    <Link
                      href={`/dashboard/orders/${o.id}`}
                      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {o.brief.projectName}
                          </span>
                          <OrderStatusBadge status={o.status} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="font-mono">{o.code}</span>
                          <span>{pkg?.name ?? "Permintaan kustom"}</span>
                          <span>{relativeTime(o.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold tabular-nums">
                          {formatIDR(o.finalPrice)}
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground inline-block mt-1" />
                      </div>
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
