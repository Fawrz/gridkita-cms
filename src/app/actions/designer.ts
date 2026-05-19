"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

const DELIVERABLE_DIR = join(process.cwd(), "storage", "deliverables");

export async function updateOrderStatus(orderId: string, toStatus: OrderStatus, note?: string) {
  const me = await requireRole("DESIGNER");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.designerId !== me.id) throw new Error("Tidak ditemukan.");
  if (!canTransition(order.status as OrderStatus, toStatus, "DESIGNER"))
    throw new Error(`Tidak dapat transisi ${order.status} → ${toStatus}.`);

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: toStatus } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status as OrderStatus, toStatus, changedById: me.id, note } }),
  ]);

  revalidatePath(`/designer/tasks/${orderId}`);
}

export async function uploadDeliverable(formData: FormData) {
  const me = await requireRole("DESIGNER");
  const orderId = String(formData.get("orderId"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("File tidak ada.");

  await mkdir(DELIVERABLE_DIR, { recursive: true });
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(join(DELIVERABLE_DIR, filename), Buffer.from(await file.arrayBuffer()));

  await db.deliverable.create({
    data: {
      orderId, designerId: me.id,
      path: `deliverables/${filename}`,
      fileName: file.name, mimeType: file.type, sizeBytes: file.size,
    },
  });

  revalidatePath(`/designer/tasks/${orderId}`);
}
