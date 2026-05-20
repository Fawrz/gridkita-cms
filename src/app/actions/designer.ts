"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { revalidatePath } from "next/cache";
import { validateFile, ALLOWED_DELIVERABLE_EXTENSIONS, MAX_DELIVERABLE_SIZE } from "@/lib/upload";
import type { OrderStatus } from "@/types";

const DELIVERABLE_DIR = join(process.cwd(), "storage", "deliverables");

export async function updateOrderStatus(orderId: string, toStatus: OrderStatus, note?: string) {
  const me = await requireRole("DESIGNER");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.designerId !== me.id) throw new Error("Tidak ditemukan.");
  if (!canTransition(order.status as OrderStatus, toStatus, "DESIGNER"))
    throw new Error(`Tidak dapat transisi ${order.status} → ${toStatus}.`);

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: {
        status: toStatus,
        ...(toStatus === "DONE" ? { adminApprovedDeliverable: false } : {}),
      },
    }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status as OrderStatus, toStatus, changedById: me.id, note } }),
  ]);

  revalidatePath(`/designer/tasks/${orderId}`);
  redirect(`/designer/tasks/${orderId}?statusUpdated=1`);
}

export async function uploadDeliverable(formData: FormData) {
  const me = await requireRole("DESIGNER");
  const orderId = String(formData.get("orderId"));

  const files = formData.getAll("file") as File[];
  const validFiles = files.filter((f) => f && f.size > 0);

  if (!validFiles.length) {
    redirect(`/designer/tasks/${orderId}?uploadError=missing-file`);
  }

  for (const file of validFiles) {
    const validation = validateFile(file, ALLOWED_DELIVERABLE_EXTENSIONS, MAX_DELIVERABLE_SIZE);
    if (!validation.valid) {
      redirect(`/designer/tasks/${orderId}?uploadError=${encodeURIComponent(validation.error!)}`);
    }
  }

  await mkdir(DELIVERABLE_DIR, { recursive: true });

  const uploadedFiles: string[] = [];
  for (const file of validFiles) {
    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(join(DELIVERABLE_DIR, filename), Buffer.from(await file.arrayBuffer()));

    await db.deliverable.create({
      data: {
        orderId,
        designerId: me.id,
        path: `deliverables/${filename}`,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      },
    });

    uploadedFiles.push(file.name);
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (order?.clientId) {
    await db.notification.create({
      data: {
        userId: order.clientId,
        type: "DELIVERABLE_UPLOADED",
        title: "Deliverable siap di-review",
        message: `Desainer telah mengunggah ${uploadedFiles.length} file untuk order ${order.code}.`,
        link: `/dashboard/orders/${orderId}`,
      },
    });
  }

  revalidatePath(`/designer/tasks/${orderId}`);
  redirect(`/designer/tasks/${orderId}?uploadSuccess=${uploadedFiles.length}`);
}
