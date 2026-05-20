"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { calculateSplit } from "@/lib/payroll";
import { revalidatePath } from "next/cache";
import { validateFile, ALLOWED_ATTACHMENT_EXTENSIONS, MAX_ATTACHMENT_SIZE } from "@/lib/upload";

const BRIEFS_DIR = join(process.cwd(), "storage", "briefs");

async function generateCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.order.count({ where: { code: { startsWith: `GK-${year}-` } } });
  return `GK-${year}-${String(count + 1).padStart(4, "0")}`;
}

async function uploadAttachments(orderId: string, userId: string, formData: FormData) {
  const files = formData.getAll("files") as File[];
  const validFiles = files.filter((f) => f && f.size > 0);
  if (!validFiles.length) return;

  for (const file of validFiles) {
    const validation = validateFile(file, ALLOWED_ATTACHMENT_EXTENSIONS, MAX_ATTACHMENT_SIZE);
    if (!validation.valid) {
      redirect(`/dashboard/orders/${orderId}?attachmentError=${encodeURIComponent(validation.error!)}`);
    }
  }

  await mkdir(BRIEFS_DIR, { recursive: true });

  for (const file of validFiles) {
    const ext = file.name.split(".").pop() ?? "bin";
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(join(BRIEFS_DIR, filename), Buffer.from(await file.arrayBuffer()));

    await db.orderAttachment.create({
      data: {
        orderId,
        path: `briefs/${filename}`,
        name: file.name,
        uploadedById: userId,
        kind: "REFERENCE",
      },
    });
  }
}

export async function createPackageOrder(packageId: string, briefData: Record<string, string>, formData?: FormData) {
  const me = await requireRole("CLIENT");
  const pkg = await db.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) throw new Error("Paket tidak ditemukan.");

  const order = await db.order.create({
    data: {
      code: await generateCode(),
      clientId: me.id,
      type: "PACKAGE",
      servicePackageId: packageId,
      finalPrice: pkg.basePrice,
      status: "PENDING_PAYMENT",
      briefData,
    },
  });

  await db.payment.create({
    data: { orderId: order.id, amount: pkg.basePrice, qrisImageUrl: "/qris-sample.svg" },
  });

  await db.orderStatusHistory.create({
    data: { orderId: order.id, toStatus: "PENDING_PAYMENT", changedById: me.id },
  });

  if (formData) {
    await uploadAttachments(order.id, me.id, formData);
  }

  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    await db.notification.create({
      data: {
        userId: admin.id, type: "ORDER_NEW",
        title: "Order baru masuk",
        message: `Order ${order.code} dari ${me.name} telah masuk.`,
        link: `/admin/orders/${order.id}`,
      },
    });
  }

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}

export async function createCustomOrder(description: string, briefData: Record<string, string>, formData?: FormData) {
  const me = await requireRole("CLIENT");
  const order = await db.order.create({
    data: {
      code: await generateCode(),
      clientId: me.id,
      type: "CUSTOM",
      customDescription: description,
      finalPrice: 0,
      status: "QUOTE_REQUESTED",
      briefData,
    },
  });
  await db.orderStatusHistory.create({
    data: { orderId: order.id, toStatus: "QUOTE_REQUESTED", changedById: me.id },
  });

  if (formData) {
    await uploadAttachments(order.id, me.id, formData);
  }

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}

export async function cancelOrder(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (!canTransition(order.status as never, "CANCELLED", me.role as never))
    throw new Error("Tidak dapat membatalkan pada status ini.");

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: "CANCELLED", changedById: me.id } }),
  ]);
  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/dashboard/orders/${orderId}?toast=order-cancelled`);
}

export async function requestRevision(orderId: string, note: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");

  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: "REVISION", revisionCount: { increment: 1 }, adminApprovedDeliverable: false },
    }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: "REVISION", changedById: me.id, note } }),
  ]);

  if (order.designerId) {
    await db.notification.create({
      data: {
        userId: order.designerId, type: "ORDER_REVISION",
        title: "Klien meminta revisi",
        message: `Order ${order.code} mendapat permintaan revisi #${order.revisionCount + 1}.`,
        link: `/designer/tasks/${orderId}`,
      },
    });
  }
  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/dashboard/orders/${orderId}?toast=revision-requested`);
}

export async function confirmDelivered(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "DONE") throw new Error("Order belum DONE.");
  if (!order.adminApprovedDeliverable) throw new Error("Hasil desain belum diteruskan oleh admin.");

  const split = calculateSplit(Number(order.finalPrice));

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: "DONE",
        toStatus: "DELIVERED",
        changedById: me.id,
        note: "Klien menyetujui hasil desain final.",
      },
    });
    await tx.payrollEntry.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId, designerId: order.designerId!,
        orderTotal: order.finalPrice,
        commissionAmount: split.designerShare,
        companyShare: split.companyShare,
        status: "ACCRUED",
      },
    });
    await tx.cashFlow.create({
      data: {
        type: "INCOME", source: "COMMISSION_SHARE",
        amount: split.companyShare,
        description: `Bagian perusahaan 30% - ${order.code}`,
        sourceOrderId: orderId,
        recordedById: me.id,
      },
    });
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
  redirect(`/dashboard/orders/${orderId}?toast=order-delivered`);
}
