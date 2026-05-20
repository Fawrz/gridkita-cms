import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Check,
  RotateCcw,
  FileText,
  AlertCircle,
} from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OrderTimeline } from "@/components/order-timeline";
import { requireRole } from "@/lib/session";
import {
  orderById,
  historyByOrder,
  deliverablesByOrder,
} from "@/lib/queries/orders";
import { packageById } from "@/lib/queries/catalog";
import { userById, allUsers } from "@/lib/queries/users";
import { calculateSplit } from "@/lib/payroll";
import { formatIDR, formatDate, formatDateTime } from "@/lib/format";
import { updateOrderStatus, uploadDeliverable } from "@/app/actions/designer";
import { DeliverableUpload } from "@/components/deliverable-upload";
import type { OrderStatus } from "@/types";

const DESIGNER_TARGET_STATUSES = ["IN_PROGRESS", "DONE"] as const satisfies readonly OrderStatus[];

function isDesignerTargetStatus(status: string): status is (typeof DESIGNER_TARGET_STATUSES)[number] {
  return DESIGNER_TARGET_STATUSES.includes(status as (typeof DESIGNER_TARGET_STATUSES)[number]);
}

export default async function DesignerTaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uploadSuccess?: string; uploadError?: string; statusUpdated?: string }>;
}) {
  const me = await requireRole("DESIGNER");
  const { id } = await params;
  const { uploadSuccess, uploadError, statusUpdated } = await searchParams;
  const order = await orderById(id);
  if (!order || order.designerId !== me.id) notFound();

  const pkg = order.servicePackageId ? await packageById(order.servicePackageId) : null;
  const client = await userById(order.clientId);
  const history = await historyByOrder(order.id);
  const deliverables = await deliverablesByOrder(order.id);
  const split = calculateSplit(order.finalPrice);
  const usersList = await allUsers();
  const usersMap = new Map(usersList.map(u => [u.id, u]));

  const canStart = order.status === "ASSIGNED";
  const canFinish = ["IN_PROGRESS", "REVISION"].includes(order.status);

  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const orderId = String(formData.get("orderId"));
    const toStatus = String(formData.get("toStatus"));
    if (!isDesignerTargetStatus(toStatus)) throw new Error("Status tidak valid.");
    const note = String(formData.get("note") || "");
    await updateOrderStatus(orderId, toStatus, note || undefined);
  }

  return (
    <>
      <Link
        href="/designer/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Daftar tugas
      </Link>

      <PageHeader
        title={order.brief.projectName}
        description={
          <span className="font-mono text-xs">
            {order.code} · klien {client?.name}
          </span>
        }
        actions={<OrderStatusBadge status={order.status} className="text-sm py-1 px-2.5" />}
      />

      {uploadError && (
        <Alert className="mb-6 border-destructive/40 bg-destructive/5">
          <AlertCircle className="size-4 text-destructive" />
          <AlertTitle>Upload gagal</AlertTitle>
          <AlertDescription>{decodeURIComponent(uploadError)}</AlertDescription>
        </Alert>
      )}

      {uploadSuccess && (
        <Alert className="mb-6 border-success/40 bg-success/5">
          <Check className="size-4 text-success" />
          <AlertTitle>Upload berhasil</AlertTitle>
          <AlertDescription>
            {uploadSuccess} file berhasil diunggah. Klik &quot;Tandai Selesai&quot; untuk mengirim ke klien.
          </AlertDescription>
        </Alert>
      )}

      {statusUpdated && (
        <Alert className="mb-6 border-success/40 bg-success/5">
          <Check className="size-4 text-success" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>Status pekerjaan berhasil diperbarui.</AlertDescription>
        </Alert>
      )}

      {order.status === "REVISION" && (
        <Alert className="mb-6 border-warning/40 bg-warning/5">
          <AlertCircle className="size-4 text-warning" />
          <AlertTitle>Klien meminta revisi (#{order.revisionCount})</AlertTitle>
          <AlertDescription>
            Cek catatan revisi di timeline & lakukan perbaikan, lalu unggah ulang.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          {/* Brief */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="size-4" /> Brief Klien
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
              </dl>

              {order.attachments.length > 0 && (
                <div className="mt-5 pt-5 border-t">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                    Lampiran Klien
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {order.attachments.map((a) => (
                      <div
                        key={a.id}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted border"
                      >
                        <Image src={a.url} alt={a.name} fill sizes="120px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action: Mulai Pengerjaan */}
          {canStart && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-3">Tindakan</h2>
                <form action={handleUpdateStatus}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="toStatus" value="IN_PROGRESS" />
                  <SubmitButton loadingText="Memulai..." size="lg">
                    <Play className="size-4 mr-1.5" /> Mulai Pengerjaan
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Action: Upload & Selesai */}
          {canFinish && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="font-semibold">Upload Deliverable</h2>

                <DeliverableUpload orderId={order.id} action={uploadDeliverable} />

                {/* Existing deliverables */}
                {deliverables.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium text-sm mb-3">
                      File Terupload ({deliverables.length})
                    </h3>
                    <ul className="space-y-2">
                      {deliverables.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{d.fileName}</div>
                            <div className="text-xs text-muted-foreground">
                              {(d.sizeBytes / 1024 / 1024).toFixed(1)} MB ·{" "}
                              {formatDateTime(d.uploadedAt)}
                            </div>
                          </div>
                          <Badge variant="outline">final</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tandai Selesai - hanya muncul jika ada deliverable */}
                {deliverables.length > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <form action={handleUpdateStatus}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="toStatus" value="DONE" />
                      <SubmitButton loadingText="Mengubah status..." variant="outline" className="w-full">
                        <CheckCircle2 className="size-4 mr-1.5" />
                        {order.status === "REVISION" ? "Selesaikan Revisi" : "Tandai Pekerjaan Selesai"}
                      </SubmitButton>
                    </form>
                    <p className="text-xs text-muted-foreground text-center">
                      Pastikan semua file final sudah terupload sebelum menyelesaikan pekerjaan.
                    </p>
                  </div>
                )}

                {/* Tandai Revisi - hanya jika IN_PROGRESS */}
                {order.status === "IN_PROGRESS" && (
                  <div className="pt-2">
                    <form action={handleUpdateStatus}>
                      <input type="hidden" name="orderId" value={order.id} />
                      <input type="hidden" name="toStatus" value="REVISION" />
                      <SubmitButton loadingText="Mengubah status..." variant="outline" className="w-full">
                        <RotateCcw className="size-4 mr-1.5" /> Tandai Revisi
                      </SubmitButton>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-5">Riwayat Status</h2>
              <OrderTimeline history={history} usersMap={usersMap} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Ringkasan
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Klien</div>
                <div className="font-medium">{client?.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Paket</div>
                <div className="font-medium">{pkg?.name ?? "Permintaan kustom"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Order</div>
                <div className="font-semibold tabular-nums">
                  {formatIDR(order.finalPrice)}
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm text-muted-foreground">
                  Komisi Anda <span className="text-[10px]">(70%)</span>
                </div>
                <div className="text-xl font-semibold text-primary tabular-nums">
                  {formatIDR(split.designerShare)}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Akan tercatat saat order DELIVERED
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
