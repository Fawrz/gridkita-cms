import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, X, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { payments, orderById } from "@/lib/mock/orders";
import { userById } from "@/lib/mock/users";
import { formatDateTime, formatIDR } from "@/lib/format";

export default function AdminPaymentsPage() {
  async function noopAction() { "use server"; redirect("/admin/payments"); }
  const list = [...payments].sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));

  return (
    <>
      <PageHeader title="Verifikasi Pembayaran" description="Approve atau reject bukti transfer QRIS yang diunggah klien." />
      <div className="grid lg:grid-cols-2 gap-4">
        {list.map((p) => {
          const order = orderById(p.orderId);
          const client = order ? userById(order.clientId) : null;
          return (
            <Card key={p.id} className={p.status === "WAITING" ? "border-warning/50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div><div className="font-semibold">{order?.code}</div><div className="text-sm text-muted-foreground">{client?.name} · {order?.brief.projectName}</div></div>
                  <Badge variant={p.status === "APPROVED" ? "default" : p.status === "WAITING" ? "outline" : "secondary"}>{p.status}</Badge>
                </div>
                <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border">
                    {p.proofImageUrl ? <Image src={p.proofImageUrl} alt="Bukti pembayaran" fill sizes="180px" className="object-cover" /> : <div className="h-full grid place-items-center text-xs text-muted-foreground">Belum ada bukti</div>}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><strong className="tabular-nums">{formatIDR(p.amount)}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span>{p.uploadedAt ? formatDateTime(p.uploadedAt) : "—"}</span></div>
                    <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/admin/orders/${p.orderId}`}><Eye className="size-4 mr-1" /> Detail order</Link></Button>
                  </div>
                </div>
                {p.status === "WAITING" && (
                  <form action={noopAction} className="mt-4 grid sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1.5"><Label>Alasan reject (jika ditolak)</Label><Textarea rows={2} placeholder="Nominal tidak sesuai / bukti tidak jelas..." /></div>
                    <Button type="submit"><Check className="size-4 mr-1" /> Approve</Button>
                    <Button type="submit" variant="outline"><X className="size-4 mr-1" /> Reject</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
