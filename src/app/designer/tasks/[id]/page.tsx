import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Play,
  CheckCircle2,
  RotateCcw,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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

export default async function DesignerTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireRole("DESIGNER");
  const { id } = await params;
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
    const toStatus = String(formData.get("toStatus")) as any;
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

          {/* Action */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-3">Tindakan</h2>
              <div className="flex flex-wrap gap-2">
                {canStart && (
                  <form action={handleUpdateStatus}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="toStatus" value="IN_PROGRESS" />
                    <Button type="submit">
                      <Play className="size-4 mr-1.5" /> Mulai Pengerjaan
                    </Button>
                  </form>
                )}
                {canFinish && (
                  <form action={handleUpdateStatus}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="toStatus" value="DONE" />
                    <Button type="submit">
                      <CheckCircle2 className="size-4 mr-1.5" /> Tandai Selesai (DONE)
                    </Button>
                  </form>
                )}
                {order.status === "IN_PROGRESS" && (
                  <form action={handleUpdateStatus}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="toStatus" value="REVISION" />
                    <Button type="submit" variant="outline">
                      <RotateCcw className="size-4 mr-1.5" /> Tandai Revisi
                    </Button>
                  </form>
                )}
              </div>

              {canFinish && (
                <form action={uploadDeliverable} className="mt-5 space-y-2">
                  <input type="hidden" name="orderId" value={order.id} />
                  <Label>Unggah deliverable final</Label>
                  <label
                    htmlFor="delivery"
                    className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="size-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      ZIP / FIG / PDF / PNG — maks 100MB
                    </span>
                    <input id="delivery" name="file" type="file" multiple className="hidden" />
                  </label>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Existing deliverables */}
          {deliverables.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-3">Deliverable Terkirim</h2>
                <ul className="space-y-2">
                  {deliverables.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{d.fileName}</div>
                        <div className="text-xs text-muted-foreground">
                          {(d.sizeBytes / 1024 / 1024).toFixed(1)} MB ·{" "}
                          {formatDateTime(d.uploadedAt)}
                        </div>
                      </div>
                      <Badge variant="outline">final</Badge>
                    </li>
                  ))}
                </ul>
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
