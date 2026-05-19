import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, UserPlus, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { orderById, historyByOrder, paymentByOrder } from "@/lib/mock/orders";
import { packageById } from "@/lib/mock/catalog";
import { activeDesigners, userById } from "@/lib/mock/users";
import { ordersByDesigner } from "@/lib/mock/orders";
import { formatDate, formatIDR } from "@/lib/format";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = orderById(id);
  if (!order) notFound();
  const client = userById(order.clientId);
  const designer = order.designerId ? userById(order.designerId) : null;
  const pkg = order.servicePackageId ? packageById(order.servicePackageId) : null;
  const payment = paymentByOrder(order.id);
  const history = historyByOrder(order.id);

  async function noopAction() { "use server"; redirect(`/admin/orders/${order!.id}`); }

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-4" /> Semua order</Link>
      <PageHeader title={order.brief.projectName} description={<span className="font-mono text-xs">{order.code} · dibuat {formatDate(order.createdAt)}</span>} actions={<OrderStatusBadge status={order.status} className="text-sm py-1 px-2.5" />} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <Card><CardContent className="p-6"><h2 className="font-semibold mb-4">Brief & Klien</h2><div className="grid sm:grid-cols-2 gap-4 text-sm"><Info label="Klien" value={`${client?.name} (${client?.email})`} /><Info label="Paket" value={pkg?.name ?? "Permintaan kustom"} /><Info label="Tujuan" value={order.brief.goals} full />{order.customDescription && <Info label="Deskripsi Kustom" value={order.customDescription} full />}{order.brief.styleNotes && <Info label="Style" value={order.brief.styleNotes} />}{order.brief.deadline && <Info label="Deadline" value={formatDate(order.brief.deadline)} />}</div></CardContent></Card>
          <Card><CardContent className="p-6"><h2 className="font-semibold mb-4">Aksi Admin</h2><div className="grid md:grid-cols-2 gap-4">
            <form action={noopAction} className="space-y-2"><Label>Assign / Reassign Designer</Label><Select name="designer" defaultValue={order.designerId}><SelectTrigger><SelectValue placeholder="Pilih desainer" /></SelectTrigger><SelectContent>{activeDesigners().map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {ordersByDesigner(d.id).filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length} aktif</SelectItem>)}</SelectContent></Select><Button type="submit" className="w-full"><UserPlus className="size-4 mr-1.5" /> Assign</Button></form>
            <form action={noopAction} className="space-y-2"><Label>Catatan perubahan status</Label><Textarea rows={3} placeholder="Catatan internal / alasan perubahan..." /><div className="flex gap-2"><Button type="submit" variant="outline" className="flex-1"><RotateCcw className="size-4 mr-1" /> Revisi</Button><Button type="submit" className="flex-1"><CheckCircle2 className="size-4 mr-1" /> Delivered</Button></div></form>
          </div></CardContent></Card>
          <Card><CardContent className="p-6"><h2 className="font-semibold mb-5">Audit Trail Status</h2><OrderTimeline history={history} /></CardContent></Card>
        </div>
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card><CardContent className="p-5 space-y-3"><div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Ringkasan</div><Info label="Total" value={order.finalPrice ? formatIDR(order.finalPrice) : "Belum quote"} /><Info label="Tipe" value={order.type} /><Info label="Designer" value={designer?.name ?? "Belum di-assign"} /><Info label="Revisi" value={`${order.revisionCount}×`} />{payment && <><div className="border-t pt-3" /><Info label="Payment" value={payment.status} /><Info label="Bukti" value={payment.proofImageUrl ? "Ada" : "Belum ada"} /></>}<Badge variant="outline">Mock UI — belum mutate DB</Badge></CardContent></Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div><div className="mt-0.5">{value}</div></div>;
}
