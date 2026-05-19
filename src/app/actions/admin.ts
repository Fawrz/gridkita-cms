"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function assignOrder(orderId: string, designerId: string) {
  const me = await requireRole("ADMIN");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");

  const fromStatus = order.status;
  const toStatus = order.status === "PAID" ? "ASSIGNED" : order.status;

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { designerId, status: toStatus } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus, toStatus, changedById: me.id, note: `Ditugaskan ke desainer` } }),
  ]);

  await db.notification.create({
    data: {
      userId: designerId, type: "ORDER_ASSIGNED",
      title: "Order baru ditugaskan",
      message: `Anda mendapat order ${order.code}.`,
      link: `/designer/tasks/${orderId}`,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function sendQuote(orderId: string, price: number, days: number, note: string) {
  const me = await requireRole("ADMIN");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { quotedPrice: price, finalPrice: price, status: "QUOTE_OFFERED" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "QUOTE_REQUESTED", toStatus: "QUOTE_OFFERED", changedById: me.id, note: `Quote: Rp${price} / ${days} hari. ${note}` } }),
  ]);

  await db.notification.create({
    data: {
      userId: order.clientId, type: "QUOTE_OFFERED",
      title: "Penawaran dari GridKita",
      message: `Admin telah mengirim penawaran harga untuk order ${order.code}.`,
      link: `/dashboard/orders/${orderId}`,
    },
  });

  revalidatePath("/admin/quotes");
}

export async function processPayrollBatch(designerIds: string[], periodMonth: string) {
  const me = await requireRole("ADMIN");
  const entries = await db.payrollEntry.findMany({
    where: { designerId: { in: designerIds }, status: "ACCRUED" },
  });
  if (!entries.length) throw new Error("Tidak ada entri accrued.");

  const total = entries.reduce((s, e) => s + Number(e.commissionAmount), 0);
  await db.$transaction([
    db.payoutBatch.create({
      data: {
        periodMonth, totalAmount: total, processedById: me.id,
        entries: { connect: entries.map((e) => ({ id: e.id })) },
      },
    }),
    db.payrollEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { status: "PAID_OUT", paidOutAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/payroll");
  redirect("/admin/payroll");
}

export async function acceptQuote(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "QUOTE_OFFERED") throw new Error("Order bukan status QUOTE_OFFERED.");

  await db.$transaction([
    db.payment.upsert({
      where: { orderId },
      update: {},
      create: { orderId, amount: order.finalPrice, qrisImageUrl: "/qris-sample.svg" },
    }),
    db.order.update({ where: { id: orderId }, data: { status: "PENDING_PAYMENT" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "QUOTE_OFFERED", toStatus: "PENDING_PAYMENT", changedById: me.id, note: "Klien menyetujui quote" } }),
  ]);

  revalidatePath(`/dashboard/orders/${orderId}`);
}
