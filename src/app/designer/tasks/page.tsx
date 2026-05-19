import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { EntityCard } from "@/components/entity-card";
import { requireRole } from "@/lib/session";
import { ordersByDesigner } from "@/lib/queries/orders";
import { packages } from "@/lib/queries/catalog";
import { allUsers } from "@/lib/queries/users";
import { formatIDR, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";

const TABS: { key: string; label: string; match?: OrderStatus[] }[] = [
  { key: "todo", label: "Aktif", match: ["ASSIGNED", "IN_PROGRESS", "REVISION", "DONE"] },
  { key: "delivered", label: "Selesai", match: ["DELIVERED"] },
  { key: "all", label: "Semua" },
];

export default async function DesignerTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const me = await requireRole("DESIGNER");
  const { tab = "todo" } = await searchParams;
  const t = TABS.find((x) => x.key === tab) ?? TABS[0];
  let list = await ordersByDesigner(me.id);
  const allPackages = await packages();
  const usersList = await allUsers();
  const packageMap = new Map(allPackages.map(p => [p.id, p]));
  const userMap = new Map(usersList.map(u => [u.id, u]));
  if (t.match) list = list.filter((o) => t.match!.includes(o.status));
  list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader
        title="To-Do List"
        description="Prioritaskan task aktif, revisi, dan deliverable yang perlu dikirim."
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((x) => (
          <Link
            key={x.key}
            href={x.key === "todo" ? "/designer/tasks" : `/designer/tasks?tab=${x.key}`}
            scroll={false}
          >
            <Badge variant={tab === x.key ? "default" : "outline"} className="min-h-8 px-3">
              {x.label}
            </Badge>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Tidak ada tugas di kategori &quot;{t.label}&quot;.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {list.map((o) => {
              const client = userMap.get(o.clientId);
              const pkg = o.servicePackageId ? packageMap.get(o.servicePackageId) : null;
              const commission = Math.round(o.finalPrice * 0.7);
              return (
                <EntityCard
                  key={o.id}
                  href={`/designer/tasks/${o.id}`}
                  eyebrow={<span className="font-mono">{o.code}</span>}
                  title={o.brief.projectName}
                  status={<OrderStatusBadge status={o.status} />}
                  meta={
                    <>
                      <span>{client?.name} / {pkg?.name ?? "Custom"}</span>
                      <span className="block">Update: {formatDate(o.updatedAt)}</span>
                      {o.revisionCount > 0 && <span className="block text-warning">Revisi #{o.revisionCount}</span>}
                    </>
                  }
                  value={formatIDR(commission)}
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
                      <th className="px-4 py-3 font-medium">Project & Klien</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">Update</th>
                      <th className="px-4 py-3 text-right font-medium">Komisi (70%)</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {list.map((o) => {
                      const client = userMap.get(o.clientId);
                      const pkg = o.servicePackageId ? packageMap.get(o.servicePackageId) : null;
                      const commission = Math.round(o.finalPrice * 0.7);
                      return (
                        <tr key={o.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{o.code}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{o.brief.projectName}</div>
                            <div className="text-xs text-muted-foreground">{client?.name} / {pkg?.name ?? "Custom"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <OrderStatusBadge status={o.status} />
                            {o.revisionCount > 0 && <span className="mt-1 block text-[10px] text-warning">Revisi #{o.revisionCount}</span>}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDate(o.updatedAt)}</td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums">{formatIDR(commission)}</td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/designer/tasks/${o.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                              Buka <ArrowRight className="size-3.5" />
                            </Link>
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
    </>
  );
}
