import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const STORAGE = join(process.cwd(), "storage");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  let filePath: string | null = null;
  let mimeType = "application/octet-stream";

  if (id.startsWith("proof-")) {
    const paymentId = id.replace("proof-", "");
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment?.proofPath) return new NextResponse("Not Found", { status: 404 });
    const order = await db.order.findUnique({ where: { id: payment.orderId } });
    if (session.user.role !== "ADMIN" && order?.clientId !== session.user.id)
      return new NextResponse("Forbidden", { status: 403 });
    filePath = payment.proofPath;
    mimeType = "image/jpeg";

  } else if (id.startsWith("deliverable-")) {
    const dId = id.replace("deliverable-", "");
    const d = await db.deliverable.findUnique({ where: { id: dId } });
    if (!d) return new NextResponse("Not Found", { status: 404 });
    const order = await db.order.findUnique({ where: { id: d.orderId } });
    if (
      session.user.role !== "ADMIN" &&
      order?.clientId !== session.user.id &&
      d.designerId !== session.user.id
    ) return new NextResponse("Forbidden", { status: 403 });
    filePath = d.path;
    mimeType = d.mimeType;

  } else {
    const att = await db.orderAttachment.findUnique({ where: { id } });
    if (!att) return new NextResponse("Not Found", { status: 404 });
    const order = await db.order.findUnique({ where: { id: att.orderId } });
    if (
      session.user.role !== "ADMIN" &&
      order?.clientId !== session.user.id &&
      order?.designerId !== session.user.id
    ) return new NextResponse("Forbidden", { status: 403 });
    filePath = att.path;
  }

  try {
    const file = await readFile(join(STORAGE, filePath));
    return new NextResponse(file, { headers: { "Content-Type": mimeType } });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
