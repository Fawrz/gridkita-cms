import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Check,
  X,
  RotateCcw,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { PaymentProofForm } from "@/components/payment-proof-form";
import { requireRole } from "@/lib/session";
import {
  orderById,
  historyByOrder,
  paymentByOrder,
  deliverablesByOrder,
} from "@/lib/queries/orders";
import { packageById } from "@/lib/queries/catalog";
import { userById, allUsers } from "@/lib/queries/users";
import { formatIDR, formatDate, formatDateTime } from "@/lib/format";
import { cancelOrder, requestRevision, confirmDelivered } from "@/app/actions/orders";
import { uploadPaymentProof } from "@/app/actions/payments";
import { acceptQuote } from "@/app/actions/admin";

export default async function ClientOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentError?: string; paymentSuccess?: string }>;
}) {
  const me = await requireRole("CLIENT");
  const { id } = await params;
  const { paymentError, paymentSuccess } = await searchParams;
  const order = await orderById(id);
  if (!order || order.clientId !== me.id) notFound();
  const pkg = order.servicePackageId ? await packageById(order.servicePackageId) : null;
  const designer = order.designerId ? await userById(order.designerId) : null;
  const payment = await paymentByOrder(order.id);
  const history = await historyByOrder(order.id);
  const deliverables = await deliverablesByOrder(order.id);
  const allUsersList = await allUsers();
  const userMap = new Map(allUsersList.map(u => [u.id, u]));

  const showQris = order.status === "PENDING_PAYMENT";
  const canReviewDeliverables = order.status === "DONE" && order.adminApprovedDeliverable;
  const canConfirmDone = canReviewDeliverables;
  const canRevision = canReviewDeliverables;
  const deliveredHistory = history.find((h) => h.toStatus === "DELIVERED");
  const canCancel = ["PENDING_PAYMENT", "QUOTE_REQUESTED", "QUOTE_OFFERED"].includes(
    order.status
  );

  async function handleAcceptQuote() {
    "use server";
    await acceptQuote(order!.id);
  }
  async function handleRejectQuote() {
    "use server";
    await cancelOrder(order!.id);
  }
  async function handleUploadProof(formData: FormData) {
    "use server";
    formData.set("orderId", order!.id);
    await uploadPaymentProof(formData);
  }
  async function handleConfirmDelivered() {
    "use server";
    await confirmDelivered(order!.id);
  }
  async function handleRequestRevision(formData: FormData) {
    "use server";
    const note = String(formData.get("revisionNote") || "");
    await requestRevision(order!.id, note);
  }
  async function handleCancel() {
    "use server";
    await cancelOrder(order!.id);
  }

  return (
    <>
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Semua pesanan
      </Link>

      <PageHeader
        title={order.brief.projectName}
        description={
          <span className="font-mono text-xs">
            {order.code} · dibuat {formatDate(order.createdAt)}
          </span>
        }
        actions={<OrderStatusBadge status={order.status} className="text-sm py-1 px-2.5" />}
      />

      {/* Status alert banner */}
      {order.status === "QUOTE_OFFERED" && order.quotedPrice && (
        <Alert className="mb-6 border-info/40 bg-info/5">
          <AlertCircle className="size-4" />
          <AlertTitle>Penawaran Tersedia</AlertTitle>
          <AlertDescription>
            Admin menawarkan harga{" "}
            <strong className="tabular-nums">{formatIDR(order.quotedPrice)}</strong>.
            Setujui untuk lanjut ke pembayaran, atau tolak.
            <div className="mt-3 flex gap-2">
              <form action={handleAcceptQuote}>
                <SubmitButton loadingText="Memproses..." size="sm">
                  <Check className="size-4 mr-1" /> Setujui & Bayar
                </SubmitButton>
              </form>
              <form action={handleRejectQuote}>
                <SubmitButton loadingText="Memproses..." size="sm" variant="outline">
                  <X className="size-4 mr-1" /> Tolak
                </SubmitButton>
              </form>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {payment?.status === "REJECTED" && payment.rejectReason && (
        <Alert className="mb-6 border-destructive/40 bg-destructive/5">
          <AlertCircle className="size-4 text-destructive" />
          <AlertTitle>Bukti Pembayaran Ditolak</AlertTitle>
          <AlertDescription>{payment.rejectReason}</AlertDescription>
        </Alert>
      )}

      {paymentError && (
        <Alert className="mb-6 border-destructive/40 bg-destructive/5">
          <AlertCircle className="size-4 text-destructive" />
          <AlertTitle>Upload bukti pembayaran belum berhasil</AlertTitle>
          <AlertDescription>
            {paymentError === "file-too-large"
              ? "Ukuran file maksimal 5MB. Pilih file yang lebih kecil lalu kirim ulang."
              : "Pilih file bukti transfer terlebih dahulu sebelum mengirim pembayaran."}
          </AlertDescription>
        </Alert>
      )}

      {paymentSuccess === "uploaded" && (
        <Alert className="mb-6 border-success/40 bg-success/5">
          <Check className="size-4 text-success" />
          <AlertTitle>Bukti pembayaran terkirim</AlertTitle>
          <AlertDescription>
            Bukti pembayaran berhasil diunggah dan sedang menunggu verifikasi admin.
          </AlertDescription>
        </Alert>
      )}

      {order.status === "DONE" && !order.adminApprovedDeliverable && (
        <Alert className="mb-6 border-info/40 bg-info/5">
          <AlertCircle className="size-4" />
          <AlertTitle>Hasil desain sedang direview admin</AlertTitle>
          <AlertDescription>
            Desainer sudah menyelesaikan pekerjaan. File hasil desain akan tersedia setelah admin menyetujui dan meneruskannya ke Anda.
          </AlertDescription>
        </Alert>
      )}

      {order.status === "DELIVERED" && (
        <Alert className="mb-6 border-success/40 bg-success/5">
          <Check className="size-4 text-success" />
          <AlertTitle>Hasil Desain Disetujui</AlertTitle>
          <AlertDescription>
            Anda telah menyetujui hasil desain ini
            {deliveredHistory ? ` pada ${formatDateTime(deliveredHistory.changedAt)}` : ""}.
            Order sudah selesai dan tidak ada revisi lanjutan.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          {/* Brief */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="size-4" /> Brief Project
              </h2>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Detail label="Tujuan" value={order.brief.goals} />
                {order.brief.targetAudience && (
                  <Detail label="Target Audiens" value={order.brief.targetAudience} />
                )}
                {order.brief.styleNotes && (
                  <Detail label="Catatan Gaya" value={order.brief.styleNotes} />
                )}
                {order.brief.colorPreferences && (
                  <Detail label="Preferensi Warna" value={order.brief.colorPreferences} />
                )}
                {order.brief.deadline && (
                  <Detail label="Deadline" value={formatDate(order.brief.deadline)} />
                )}
                {order.customDescription && (
                  <Detail
                    label="Deskripsi Kustom"
                    value={order.customDescription}
                    full
                  />
                )}
              </dl>

              {order.attachments.length > 0 && (
                <div className="mt-5 pt-5 border-t">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Lampiran Referensi
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {order.attachments.map((a) => (
                      <div
                        key={a.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted border"
                      >
                        <Image
                          src={a.url}
                          alt={a.name}
                          fill
                          sizes="120px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment / QRIS */}
          {showQris && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="size-4" /> Pembayaran
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan QRIS di bawah & unggah bukti transfer.
                </p>
                <div className="grid sm:grid-cols-[200px_1fr] gap-5">
                  <div className="aspect-square bg-card border-2 border-dashed rounded-xl grid place-items-center text-center p-3 text-xs text-muted-foreground">
                    QRIS
                    <br />
                    GridKita Creative
                    <br />
                    {formatIDR(order.finalPrice)}
                  </div>
                  <PaymentProofForm action={handleUploadProof} />
                </div>
              </CardContent>
            </Card>
          )}

          {payment?.status === "WAITING" && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="size-4" /> Bukti Pembayaran Terkirim
                </h2>
                <p className="text-sm text-muted-foreground">
                  Diunggah {payment.uploadedAt && formatDateTime(payment.uploadedAt)}.
                  Menunggu verifikasi admin (biasanya &lt; 1 jam pada jam kerja).
                </p>
                {payment.proofImageUrl && (
                  <div className="mt-4 relative aspect-[4/3] max-w-sm rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src={payment.proofImageUrl}
                      alt="Bukti transfer"
                      fill
                      sizes="400px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {((order.status === "DONE" && order.adminApprovedDeliverable) || order.status === "DELIVERED") && deliverables.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">Hasil Desain</h2>
                <ul className="space-y-2">
                  {deliverables.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{d.fileName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(d.sizeBytes / 1024 / 1024).toFixed(1)} MB ·{" "}
                          {formatDateTime(d.uploadedAt)}
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href={d.url} download>
                          <Download className="size-4 mr-1" /> Unduh
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action zone */}
          {canConfirmDone && (
            <Card className="border-success/40 bg-success/5">
              <CardContent className="p-6">
                <h2 className="font-semibold mb-2">Hasil Sudah Sesuai?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Terima hasil jika sudah sesuai, atau minta revisi dengan catatan.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <form action={handleConfirmDelivered}>
                    <SubmitButton loadingText="Memproses..." className="w-full">
                      <Check className="size-4 mr-1" /> Terima & Selesai
                    </SubmitButton>
                  </form>
                </div>
                {canRevision && (
                  <form action={handleRequestRevision} className="mt-4 space-y-2">
                    <Label htmlFor="revisionNote">Catatan revisi (opsional)</Label>
                    <Textarea
                      id="revisionNote"
                      name="revisionNote"
                      rows={3}
                      placeholder="Tolong ubah palette warna ke earth tone..."
                    />
                    <SubmitButton loadingText="Mengirim..." variant="outline" className="w-full">
                      <RotateCcw className="size-4 mr-1" /> Minta Revisi
                    </SubmitButton>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {canCancel && (
            <Card>
              <CardContent className="p-5 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium">Batalkan Pesanan</div>
                  <p className="text-sm text-muted-foreground">
                    Anda dapat membatalkan pesanan selama belum dibayar.
                  </p>
                </div>
                <form action={handleCancel}>
                  <SubmitButton loadingText="Membatalkan..." variant="outline">
                    <X className="size-4 mr-1" /> Batalkan
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-5">Riwayat Status</h2>
              <OrderTimeline history={history} usersMap={userMap} />
            </CardContent>
          </Card>
        </div>

        {/* Right summary column */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Ringkasan Pesanan
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Paket</div>
                <div className="font-medium">{pkg?.name ?? "Permintaan kustom"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tipe</div>
                <Badge variant="outline" className="text-xs">
                  {order.type}
                </Badge>
              </div>
              {designer && (
                <div>
                  <div className="text-sm text-muted-foreground">Desainer</div>
                  <div className="font-medium">{designer.name}</div>
                </div>
              )}
              {order.revisionCount > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground">Revisi</div>
                  <div className="font-medium tabular-nums">{order.revisionCount}×</div>
                </div>
              )}
              <div className="border-t pt-3 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold tabular-nums">
                  {order.finalPrice > 0
                    ? formatIDR(order.finalPrice)
                    : "Menunggu quote"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
