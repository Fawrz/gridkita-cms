import Link from "next/link";
import { redirect } from "next/navigation";
import { Send, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { allOrders } from "@/lib/queries/orders";
import { allUsers } from "@/lib/queries/users";
import { formatDate, formatIDR } from "@/lib/format";

export default async function AdminQuotesPage() {
  async function noopAction() { "use server"; redirect("/admin/quotes"); }
  const [ordersList, usersList] = await Promise.all([allOrders(), allUsers()]);
  const userMap = new Map(usersList.map(u => [u.id, u]));
  const list = ordersList.filter((o) => o.type === "CUSTOM").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader title="Permintaan Kustom & Quote" description="Tinjau kebutuhan custom, beri harga dan estimasi waktu." />
      <div className="grid gap-4">
        {list.map((o) => {
          const client = userMap.get(o.clientId);
          return (
            <Card key={o.id} className={o.status === "QUOTE_REQUESTED" ? "border-warning/50" : ""}>
              <CardContent className="p-5 grid lg:grid-cols-[1fr_360px] gap-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2"><Badge variant="secondary">CUSTOM</Badge><OrderStatusBadge status={o.status} /></div>
                  <h2 className="font-semibold text-lg">{o.brief.projectName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{client?.name} · {formatDate(o.createdAt)} · <span className="font-mono">{o.code}</span></p>
                  <p className="mt-4 text-sm leading-relaxed">{o.customDescription ?? o.brief.goals}</p>
                  {o.quotedPrice && <div className="mt-3 text-sm">Quote saat ini: <strong className="tabular-nums">{formatIDR(o.quotedPrice)}</strong></div>}
                  <Button asChild variant="outline" size="sm" className="mt-4"><Link href={`/admin/orders/${o.id}`}><Eye className="size-4 mr-1" /> Detail</Link></Button>
                </div>
                <form action={noopAction} className="space-y-3 rounded-xl border bg-muted/20 p-4">
                  <div className="space-y-1.5"><Label>Harga penawaran</Label><Input type="number" placeholder="cth. 1800000" defaultValue={o.quotedPrice ?? ""} /></div>
                  <div className="space-y-1.5"><Label>Estimasi hari</Label><Input type="number" placeholder="cth. 10" /></div>
                  <div className="space-y-1.5"><Label>Catatan quote</Label><Textarea rows={3} placeholder="Scope termasuk poster, e-flyer, feed 5 slot..." /></div>
                  <Button type="submit" className="w-full"><Send className="size-4 mr-1" /> Kirim Quote</Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
