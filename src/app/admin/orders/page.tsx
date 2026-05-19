import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { PageToolbar } from "@/components/page-toolbar";
import { EntityCard } from "@/components/entity-card";
import { orders } from "@/lib/mock/orders";
import { packageById } from "@/lib/mock/catalog";
import { userById } from "@/lib/mock/users";
import { formatIDR, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";

const FILTERS: { key: string; label: string; match?: OrderStatus[] }[] = [
  { key: "all", label: "Semua" },
  { key: "action", label: "Butuh tindakan", match: ["WAITING_VERIFICATION", "PAID", "QUOTE_REQUESTED", "DONE"] },
  { key: "production", label: "Produksi", match: ["ASSIGNED", "IN_PROGRESS", "REVISION"] },
  { key: "done", label: "Delivered", match: ["DELIVERED"] },
  { key: "cancelled", label: "Batal", match: ["CANCELLED"] },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
  let list = [...orders];
  if (f.match) list = list.filter((o) => f.match!.includes(o.status));
  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader
        title="Kelola Pesanan"
        description="Filter status, buka detail, assign desainer, dan lihat audit trail."
      />

      <PageToolbar
        filters={FILTERS}
        activeFilter={filter}
        baseHref="/admin/orders"
        searchPlaceholder="Cari order, klien, paket..."
      />

      <div className="grid gap-3 md:hidden">
        {list.map((o) => {
          const client = userById(o.clientId);
          const designer = o.designerId ? userById(o.designerId) : null;
          const pkg = o.servicePackageId ? packageById(o.servicePackageId) : null;
          return (
            <EntityCard
              key={o.id}
              href={`/admin/orders/${o.id}`}
              eyebrow={<span className="font-mono">{o.code}</span>}
              title={o.brief.projectName}
              status={<OrderStatusBadge status={o.status} />}
              meta={
                <>
                  <span className="font-medium text-foreground">{client?.name}</span>
                  <span className="mx-1">/</span>
                  <span>{pkg?.name ?? "Custom"}</span>
                  {designer && <span className="block">Designer: {designer.name}</span>}
                  <span className="block">Update: {formatDate(o.updatedAt)}</span>
                </>
              }
              value={o.finalPrice ? formatIDR(o.finalPrice) : "Quote"}
            />
          );
        })}
      </div>

      <Card className="hidden md:flex">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Klien</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paket</th>
                  <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Update</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((o) => {
                  const client = userById(o.clientId);
                  const designer = o.designerId ? userById(o.designerId) : null;
                  const pkg = o.servicePackageId ? packageById(o.servicePackageId) : null;
                  return (
                    <tr key={o.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.brief.projectName}</div>
                        <div className="font-mono text-xs text-muted-foreground">{o.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{client?.name}</div>
                        <div className="text-xs text-muted-foreground">{client?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{pkg?.name ?? "Custom"}</div>
                        {designer && <div className="text-xs text-muted-foreground">Designer: {designer.name}</div>}
                      </td>
                      <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDate(o.updatedAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{o.finalPrice ? formatIDR(o.finalPrice) : "Quote"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild size="icon-sm" variant="ghost" aria-label={`Buka detail ${o.code}`}>
                          <Link href={`/admin/orders/${o.id}`}>
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
  );
}
