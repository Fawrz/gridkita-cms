import Link from "next/link";
import { ArrowRight, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EntityCard } from "@/components/entity-card";
import { requireRole } from "@/lib/auth-mock";
import { ordersByClient } from "@/lib/mock/orders";
import { packageById } from "@/lib/mock/catalog";
import { formatIDR, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";
import { STATUS_LABEL } from "@/lib/state-machine";

const FILTERS: { key: string; label: string; match?: OrderStatus[] }[] = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif", match: ["PENDING_PAYMENT", "WAITING_VERIFICATION", "PAID", "ASSIGNED", "IN_PROGRESS", "REVISION", "DONE", "QUOTE_REQUESTED", "QUOTE_OFFERED"] },
  { key: "done", label: "Selesai", match: ["DELIVERED"] },
  { key: "cancelled", label: "Batal", match: ["CANCELLED"] },
];

export default async function ClientOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const me = await requireRole("CLIENT");
  const { filter = "all", q = "" } = await searchParams;
  let list = ordersByClient(me.id);
  const f = FILTERS.find((x) => x.key === filter);
  if (f?.match) list = list.filter((o) => f.match!.includes(o.status));
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter((o) => o.brief.projectName.toLowerCase().includes(ql) || o.code.toLowerCase().includes(ql));
  }
  list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader
        title="Pesanan Saya"
        description="Lihat status, pembayaran, revisi, dan file akhir dari satu tempat."
        actions={
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="size-4" /> Pesan Baru
            </Link>
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
          <form className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama project / kode order..."
              aria-label="Cari nama project atau kode order"
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
            />
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          </form>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none md:flex-wrap md:pb-0">
            <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {FILTERS.map((x) => (
              <Link
                key={x.key}
                href={x.key === "all" ? "/dashboard/orders" : `/dashboard/orders?filter=${x.key}${q ? `&q=${q}` : ""}`}
                scroll={false}
              >
                <Badge variant={filter === x.key ? "default" : "outline"} className="min-h-8 px-3">
                  {x.label}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {list.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-4 text-muted-foreground">Tidak ada pesanan dengan filter &quot;{f?.label ?? filter}&quot;.</p>
            <Button asChild><Link href="/dashboard/orders/new">Pesan baru</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {list.map((o) => {
              const pkg = o.servicePackageId ? packageById(o.servicePackageId) : null;
              return (
                <EntityCard
                  key={o.id}
                  href={`/dashboard/orders/${o.id}`}
                  eyebrow={<span className="font-mono">{o.code}</span>}
                  title={o.brief.projectName}
                  status={<OrderStatusBadge status={o.status} />}
                  meta={
                    <>
                      <span>{pkg?.name ?? "Permintaan kustom"}</span>
                      <span className="block">Dibuat: {formatDate(o.createdAt)}</span>
                    </>
                  }
                  value={o.finalPrice > 0 ? formatIDR(o.finalPrice) : "Quote"}
                />
              );
            })}
          </div>

          <Card className="hidden md:flex">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Kode</th>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Dibuat</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {list.map((o) => {
                      const pkg = o.servicePackageId ? packageById(o.servicePackageId) : null;
                      return (
                        <tr key={o.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{o.brief.projectName}</div>
                            <div className="text-xs text-muted-foreground">{pkg?.name ?? "Permintaan kustom"}</div>
                          </td>
                          <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDate(o.createdAt)}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{o.finalPrice > 0 ? formatIDR(o.finalPrice) : "Quote"}</td>
                          <td className="px-4 py-3 text-right">
                            <Button asChild size="icon-sm" variant="ghost" aria-label={`Buka detail ${o.code}`}>
                              <Link href={`/dashboard/orders/${o.id}`}>
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Menampilkan {list.length} pesanan
        {filter !== "all" && ` (filter: ${STATUS_LABEL[f?.match?.[0] ?? "DELIVERED"] ?? f?.label})`}.
      </p>
    </>
  );
}
