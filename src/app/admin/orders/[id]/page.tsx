import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, FileText, UserPlus, CheckCircle2, RotateCcw } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { orderById, historyByOrder, paymentByOrder, allOrders, deliverablesByOrder } from "@/lib/queries/orders";
import { packages } from "@/lib/queries/catalog";
import { activeDesigners, allUsers } from "@/lib/queries/users";
import { formatDate, formatDateTime, formatIDR } from "@/lib/format";
import { approveDeliverablesForClient, assignOrder } from "@/app/actions/admin";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, usersList, designersList, packagesList, ordersList] = await Promise.all([
    orderById(id),
    allUsers(),
    activeDesigners(),
    packages(),
    allOrders(),
  ]);
  if (!order) notFound();
  const userMap = new Map(usersList.map(u => [u.id, u]));
  const packageMap = new Map(packagesList.map(p => [p.id, p]));
  const client = userMap.get(order.clientId);
  const designer = order.designerId ? userMap.get(order.designerId) : null;
  const pkg = order.servicePackageId ? packageMap.get(order.servicePackageId) : null;
  const [payment, history, deliverables] = await Promise.all([
    paymentByOrder(order.id),
    historyByOrder(order.id),
    deliverablesByOrder(order.id),
  ]);
  const canAssignDesigner = ["PAID", "ASSIGNED", "IN_PROGRESS", "REVISION"].includes(order.status);
  const isAdminReview = order.status === "DONE" && !order.adminApprovedDeliverable;
  const isClientReview = order.status === "DONE" && order.adminApprovedDeliverable;
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";
  const assignmentTitle = order.status === "PAID" ? "Assign Designer" : "Assign / Reassign Designer";
  const assignmentDescription =
    order.status === "PAID"
      ? "Pembayaran sudah disetujui. Pilih desainer untuk memulai produksi."
      : order.status === "ASSIGNED"
        ? `Order sudah ditugaskan${designer ? ` ke ${designer.name}` : ""}. Menunggu desainer memulai pekerjaan.`
        : order.status === "IN_PROGRESS"
          ? "Desainer sedang mengerjakan order. Anda dapat reassign jika diperlukan."
          : "Order sedang dalam proses revisi oleh desainer. Anda dapat reassign jika diperlukan.";

  async function handleAssign(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    const designerId = String(formData.get("designer"));
    await assignOrder(orderId, designerId);
  }

  async function handleApproveDeliverables() {
    "use server";
    await approveDeliverablesForClient(order!.id);
  }

  async function handleAdminStatusChange(formData: FormData) {
    "use server";
    const me = await requireRole("ADMIN");
    const orderId = String(formData.get("orderId"));
    const toStatus = String(formData.get("toStatus")) as OrderStatus;
    const note = String(formData.get("note") || "");
    const currentOrder = await db.order.findUnique({ where: { id: orderId } });
    if (!currentOrder) throw new Error("Order tidak ditemukan.");
    if (!canTransition(currentOrder.status as OrderStatus, toStatus, "ADMIN"))
      throw new Error(`Tidak dapat transisi ${currentOrder.status} → ${toStatus}.`);
    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          status: toStatus,
          ...(toStatus === "REVISION" ? { adminApprovedDeliverable: false } : {}),
        },
      }),
      db.orderStatusHistory.create({ data: { orderId, fromStatus: currentOrder.status, toStatus, changedById: me.id, note: note || undefined } }),
    ]);
    revalidatePath(`/admin/orders/${orderId}`);
  }

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-4" /> Semua order</Link>
      <PageHeader title={order.brief.projectName} description={<span className="font-mono text-xs">{order.code} · dibuat {formatDate(order.createdAt)}</span>} actions={<OrderStatusBadge status={order.status} className="text-sm py-1 px-2.5" />} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          <Card><CardContent className="p-6"><h2 className="font-semibold mb-4">Brief & Klien</h2><div className="grid sm:grid-cols-2 gap-4 text-sm"><Info label="Klien" value={`${client?.name} (${client?.email})`} /><Info label="Paket" value={pkg?.name ?? "Permintaan kustom"} /><Info label="Tujuan" value={order.brief.goals} full />{order.customDescription && <Info label="Deskripsi Kustom" value={order.customDescription} full />}{order.brief.styleNotes && <Info label="Style" value={order.brief.styleNotes} />}{order.brief.deadline && <Info label="Deadline" value={formatDate(order.brief.deadline)} />}</div></CardContent></Card>
          {(order.status === "DONE" || order.status === "DELIVERED") && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-semibold">Hasil Desain / Deliverables</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.status === "DONE"
                        ? "Review file hasil desain sebelum diteruskan ke klien atau dikembalikan untuk revisi."
                        : "File hasil desain final yang telah diterima klien."}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {order.status === "DONE" ? "review admin" : "final"}
                  </Badge>
                </div>

                {deliverables.length > 0 ? (
                  <ul className="space-y-2">
                    {deliverables.map((d) => (
                      <li
                        key={d.id}
                        className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="rounded-md bg-muted p-2 text-muted-foreground">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{d.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {(d.sizeBytes / 1024 / 1024).toFixed(1)} MB · {formatDateTime(d.uploadedAt)}
                            </div>
                            <Badge variant="outline" className="mt-2">deliverable</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:shrink-0">
                          <Button asChild size="sm" variant="outline">
                            <a href={d.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="size-4 mr-1" /> Lihat
                            </a>
                          </Button>
                          <Button asChild size="sm">
                            <a href={d.url} download>
                              <Download className="size-4 mr-1" /> Unduh
                            </a>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Belum ada file hasil desain yang terupload.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              {isAdminReview ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold">Review Hasil Desain</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Setujui hasil untuk diteruskan ke klien, atau minta revisi ke desainer dengan catatan yang jelas.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <form action={handleApproveDeliverables}>
                      <SubmitButton loadingText="Meneruskan..." className="w-full">
                        <CheckCircle2 className="size-4 mr-1" /> Setujui & Teruskan ke Klien
                      </SubmitButton>
                    </form>
                    <form action={handleAdminStatusChange} className="space-y-2 sm:row-span-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="toStatus" value="REVISION" />
                      <Label htmlFor="revision-note">Catatan revisi untuk desainer</Label>
                      <Textarea
                        id="revision-note"
                        name="note"
                        rows={3}
                        placeholder="Tuliskan bagian yang perlu diperbaiki sebelum dikirim ke klien..."
                      />
                      <SubmitButton loadingText="Mengirim revisi..." variant="outline" className="w-full">
                        <RotateCcw className="size-4 mr-1" /> Minta Revisi ke Desainer
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ) : isClientReview ? (
                <div className="rounded-lg border border-success/40 bg-success/5 p-4">
                  <h2 className="font-semibold">Hasil Sudah Diteruskan ke Klien</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Klien dapat melihat deliverable dan memilih menerima hasil atau meminta revisi. Tidak ada aksi admin lanjutan untuk tahap ini.
                  </p>
                </div>
              ) : isDelivered ? (
                <div className="rounded-lg border border-success/40 bg-success/5 p-4">
                  <h2 className="font-semibold">Order Sudah Selesai</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Klien telah menerima hasil desain. Order berada pada status final DELIVERED.
                  </p>
                </div>
              ) : isCancelled ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <h2 className="font-semibold">Order Dibatalkan</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Order ini sudah dibatalkan. Tidak ada aksi admin lanjutan.
                  </p>
                </div>
              ) : canAssignDesigner ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold">{assignmentTitle}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{assignmentDescription}</p>
                  </div>
                  <form action={handleAssign} className="max-w-md space-y-2">
                    <input type="hidden" name="orderId" value={order.id} />
                    <Label>Pilih desainer</Label>
                    <Select name="designer" defaultValue={order.designerId}>
                      <SelectTrigger><SelectValue placeholder="Pilih desainer" /></SelectTrigger>
                      <SelectContent>
                        {designersList.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} · {ordersList.filter(o => o.designerId === d.id && !["DELIVERED", "CANCELLED"].includes(o.status)).length} aktif
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <SubmitButton loadingText="Menugaskan..." className="w-full">
                      <UserPlus className="size-4 mr-1.5" /> {order.designerId ? "Reassign Designer" : "Assign Designer"}
                    </SubmitButton>
                  </form>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h2 className="font-semibold">Belum Ada Aksi Admin</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.status === "WAITING_VERIFICATION"
                      ? "Order menunggu verifikasi pembayaran. Lanjutkan dari halaman Verifikasi Pembayaran."
                      : order.status === "QUOTE_REQUESTED"
                        ? "Order custom menunggu penawaran harga. Lanjutkan dari halaman Quote."
                        : order.status === "QUOTE_OFFERED"
                          ? "Penawaran sudah dikirim. Menunggu persetujuan klien."
                          : "Belum ada aksi admin yang diperlukan pada status ini."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card><CardContent className="p-6"><h2 className="font-semibold mb-5">Audit Trail Status</h2><OrderTimeline history={history} usersMap={userMap} /></CardContent></Card>
        </div>
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card><CardContent className="p-5 space-y-3"><div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Ringkasan</div><Info label="Total" value={order.finalPrice ? formatIDR(order.finalPrice) : "Belum quote"} /><Info label="Tipe" value={order.type} /><Info label="Designer" value={designer?.name ?? "Belum di-assign"} /><Info label="Revisi" value={`${order.revisionCount}×`} />{payment && <><div className="border-t pt-3" /><Info label="Payment" value={payment.status} /><Info label="Bukti" value={payment.proofImageUrl ? "Ada" : "Belum ada"} /></>}</CardContent></Card>
        </div>
      </div>
    </>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}><div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div><div className="mt-0.5">{value}</div></div>;
}
