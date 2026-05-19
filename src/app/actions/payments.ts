"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

const STORAGE_DIR = join(process.cwd(), "storage", "payment-proofs");

export async function uploadPaymentProof(formData: FormData) {
  const me = await requireRole("CLIENT");
  const orderId = String(formData.get("orderId"));
  const file = formData.get("proof") as File;
  if (!file || file.size === 0) throw new Error("File tidak ada.");
  if (file.size > 5 * 1024 * 1024) throw new Error("File maksimal 5MB.");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "PENDING_PAYMENT") throw new Error("Order bukan status PENDING_PAYMENT.");

  await mkdir(STORAGE_DIR, { recursive: true });
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(STORAGE_DIR, filename), buffer);

  await db.$transaction([
    db.payment.update({
      where: { orderId },
      data: { proofPath: `payment-proofs/${filename}`, status: "WAITING", uploadedAt: new Date() },
    }),
    db.order.update({ where: { id: orderId }, data: { status: "WAITING_VERIFICATION" } }),
    db.orderStatusHistory.create({
      data: { orderId, fromStatus: "PENDING_PAYMENT", toStatus: "WAITING_VERIFICATION", changedById: me.id, note: "Bukti pembayaran diunggah" },
    }),
  ]);

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/admin/payments");
}

export async function approvePayment(orderId: string) {
  const me = await requireRole("ADMIN");
  await db.$transaction([
    db.payment.update({ where: { orderId }, data: { status: "APPROVED", verifiedById: me.id, verifiedAt: new Date() } }),
    db.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID", changedById: me.id, note: "Pembayaran diverifikasi" } }),
  ]);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (order) {
    await db.notification.create({
      data: {
        userId: order.clientId, type: "PAYMENT_VERIFIED",
        title: "Pembayaran terverifikasi",
        message: `Pembayaran untuk order ${order.code} telah disetujui.`,
        link: `/dashboard/orders/${orderId}`,
      },
    });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
}

export async function rejectPayment(orderId: string, reason: string) {
  const me = await requireRole("ADMIN");
  await db.$transaction([
    db.payment.update({ where: { orderId }, data: { status: "REJECTED", rejectReason: reason } }),
    db.order.update({ where: { id: orderId }, data: { status: "PENDING_PAYMENT" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "WAITING_VERIFICATION", toStatus: "PENDING_PAYMENT", changedById: me.id, note: `Ditolak: ${reason}` } }),
  ]);
  revalidatePath("/admin/payments");
}
