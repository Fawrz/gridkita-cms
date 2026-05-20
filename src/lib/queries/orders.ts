import { db } from "@/lib/db";
import type { Order, OrderStatusHistory, Payment, Deliverable } from "@/types";
import type { Prisma } from "@prisma/client";

type PrismaOrder = Prisma.OrderGetPayload<{ include: { attachments: true } }>;

function toOrder(o: PrismaOrder): Order {
  return {
    id: o.id, code: o.code, clientId: o.clientId,
    designerId: o.designerId ?? undefined,
    type: o.type as Order["type"],
    servicePackageId: o.servicePackageId ?? undefined,
    customDescription: o.customDescription ?? undefined,
    quotedPrice: o.quotedPrice ? Number(o.quotedPrice) : undefined,
    finalPrice: Number(o.finalPrice),
    status: o.status as Order["status"],
    revisionCount: o.revisionCount,
    adminApprovedDeliverable: o.adminApprovedDeliverable,
    brief: o.briefData as unknown as Order["brief"],
    attachments: o.attachments.map((a) => ({
      id: a.id, orderId: a.orderId, url: `/api/files/${a.id}`,
      name: a.name, uploadedById: a.uploadedById,
      kind: a.kind as "BRIEF" | "REFERENCE",
      uploadedAt: a.uploadedAt.toISOString(),
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function ordersByClient(clientId: string): Promise<Order[]> {
  const list = await db.order.findMany({
    where: { clientId },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map(toOrder);
}

export async function ordersByDesigner(designerId: string): Promise<Order[]> {
  const list = await db.order.findMany({
    where: { designerId },
    include: { attachments: true },
    orderBy: { updatedAt: "desc" },
  });
  return list.map(toOrder);
}

export async function orderById(id: string): Promise<Order | undefined> {
  const o = await db.order.findUnique({ where: { id }, include: { attachments: true } });
  return o ? toOrder(o) : undefined;
}

export async function allOrders(): Promise<Order[]> {
  const list = await db.order.findMany({ include: { attachments: true }, orderBy: { updatedAt: "desc" } });
  return list.map(toOrder);
}

export async function historyByOrder(orderId: string): Promise<OrderStatusHistory[]> {
  const list = await db.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { changedAt: "asc" },
  });
  return list.map((h) => ({
    id: h.id, orderId: h.orderId,
    fromStatus: h.fromStatus as OrderStatusHistory["fromStatus"],
    toStatus: h.toStatus as OrderStatusHistory["toStatus"],
    changedById: h.changedById, note: h.note ?? undefined,
    changedAt: h.changedAt.toISOString(),
  }));
}

export async function paymentByOrder(orderId: string): Promise<Payment | undefined> {
  const p = await db.payment.findUnique({ where: { orderId } });
  if (!p) return undefined;
  return {
    id: p.id, orderId: p.orderId, amount: Number(p.amount),
    qrisImageUrl: p.qrisImageUrl,
    proofImageUrl: p.proofPath ? `/api/files/proof-${p.id}` : undefined,
    status: p.status as Payment["status"],
    verifiedById: p.verifiedById ?? undefined,
    verifiedAt: p.verifiedAt?.toISOString(),
    rejectReason: p.rejectReason ?? undefined,
    uploadedAt: p.uploadedAt?.toISOString(),
  };
}

export async function deliverablesByOrder(orderId: string): Promise<Deliverable[]> {
  const list = await db.deliverable.findMany({ where: { orderId } });
  return list.map((d) => ({
    id: d.id, orderId: d.orderId, designerId: d.designerId,
    fileName: d.fileName, url: `/api/files/deliverable-${d.id}`,
    mimeType: d.mimeType, sizeBytes: d.sizeBytes,
    uploadedAt: d.uploadedAt.toISOString(),
  }));
}

export async function payments(): Promise<Payment[]> {
  const list = await db.payment.findMany({ orderBy: { uploadedAt: "desc" } });
  return list.map((p) => ({
    id: p.id, orderId: p.orderId, amount: Number(p.amount),
    qrisImageUrl: p.qrisImageUrl,
    proofImageUrl: p.proofPath ? `/api/files/proof-${p.id}` : undefined,
    status: p.status as Payment["status"],
    verifiedById: p.verifiedById ?? undefined,
    verifiedAt: p.verifiedAt?.toISOString(),
    rejectReason: p.rejectReason ?? undefined,
    uploadedAt: p.uploadedAt?.toISOString(),
  }));
}
