import Image from "next/image";
import Link from "next/link";
import { Check, X, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { PageHeader } from "@/components/page-header";
import { payments } from "@/lib/queries/orders";
import { allOrders } from "@/lib/queries/orders";
import { allUsers } from "@/lib/queries/users";
import { formatDateTime, formatIDR } from "@/lib/format";
import { approvePayment, rejectPayment } from "@/app/actions/payments";

export default async function AdminPaymentsPage() {
  async function handleApprove(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    await approvePayment(orderId);
  }

  async function handleReject(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    const reason = String(formData.get("reason"));
    await rejectPayment(orderId, reason);
  }

  const [paymentsList, ordersList, usersList] = await Promise.all([payments(), allOrders(), allUsers()]);
  const orderMap = new Map(ordersList.map(o => [o.id, o]));
  const userMap = new Map(usersList.map(u => [u.id, u]));
  const list = [...paymentsList].sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));

  return (
    <>
      <PageHeader title="Verifikasi Pembayaran" description="Approve atau reject bukti transfer QRIS yang diunggah klien." />
      <div className="grid lg:grid-cols-2 gap-4">
        {list.map((p) => {
          const order = orderMap.get(p.orderId);
          const client = order ? userMap.get(order.clientId) : null;
          return (
            <Card key={p.id} className={p.status === "WAITING" ? "border-warning/50" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div><div className="font-semibold">{order?.code}</div><div className="text-sm text-muted-foreground">{client?.name} · {order?.brief.projectName}</div></div>
                  <Badge variant={p.status === "APPROVED" ? "default" : p.status === "WAITING" ? "outline" : "secondary"}>{p.status}</Badge>
                </div>
                <div className="grid sm:grid-cols-[180px_1fr] gap-4">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border">
                    {p.proofImageUrl ? <Image src={p.proofImageUrl} alt="Bukti pembayaran" fill sizes="180px" className="object-cover" unoptimized /> : <div className="h-full grid place-items-center text-xs text-muted-foreground">Belum ada bukti</div>}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><strong className="tabular-nums">{formatIDR(p.amount)}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span>{p.uploadedAt ? formatDateTime(p.uploadedAt) : "—"}</span></div>
                    <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/admin/orders/${p.orderId}`}><Eye className="size-4 mr-1" /> Detail order</Link></Button>
                  </div>
                </div>
                {p.status === "WAITING" && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <form action={handleApprove}>
                      <input type="hidden" name="orderId" value={p.orderId} />
                      <SubmitButton loadingText="Memproses..."><Check className="size-4 mr-1" /> Approve</SubmitButton>
                    </form>
                    <form action={handleReject} className="space-y-2">
                      <input type="hidden" name="orderId" value={p.orderId} />
                      <div className="space-y-1.5"><Label>Alasan reject (jika ditolak)</Label><Textarea name="reason" rows={2} placeholder="Nominal tidak sesuai / bukti tidak jelas..." /></div>
                      <SubmitButton loadingText="Memproses..." variant="outline"><X className="size-4 mr-1" /> Reject</SubmitButton>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
