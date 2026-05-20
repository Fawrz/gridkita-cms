import Link from "next/link";
import { Send, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { allOrders } from "@/lib/queries/orders";
import { allUsers } from "@/lib/queries/users";
import { formatDate, formatIDR } from "@/lib/format";
import { sendQuote } from "@/app/actions/admin";

export default async function AdminQuotesPage() {
  async function handleSendQuote(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    const price = Number(formData.get("price"));
    const days = Number(formData.get("days"));
    const note = String(formData.get("note"));
    await sendQuote(orderId, price, days, note);
  }

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
                <form action={handleSendQuote} className="space-y-3 rounded-xl border bg-muted/20 p-4">
                  <input type="hidden" name="orderId" value={o.id} />
                  <div className="space-y-1.5"><Label>Harga penawaran</Label><Input type="number" name="price" placeholder="cth. 1800000" defaultValue={o.quotedPrice ?? ""} /></div>
                  <div className="space-y-1.5"><Label>Estimasi hari</Label><Input type="number" name="days" placeholder="cth. 10" /></div>
                  <div className="space-y-1.5"><Label>Catatan quote</Label><Textarea name="note" rows={3} placeholder="Scope termasuk poster, e-flyer, feed 5 slot..." /></div>
                  <SubmitButton loadingText="Mengirim quote..." className="w-full"><Send className="size-4 mr-1" /> Kirim Quote</SubmitButton>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
