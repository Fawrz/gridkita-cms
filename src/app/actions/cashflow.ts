"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addManualCashFlow(data: {
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
  amount: number;
  description: string;
  occurredAt: string;
}) {
  const me = await requireRole("ADMIN");
  await db.cashFlow.create({
    data: { ...data, source: "MANUAL", recordedById: me.id, occurredAt: new Date(data.occurredAt) },
  });
  revalidatePath("/admin/cashflow");
  revalidatePath("/admin/reports");
}

export async function toggleRecurring(id: string) {
  await requireRole("ADMIN");
  const r = await db.recurringExpense.findUnique({ where: { id } });
  if (!r) throw new Error("Tidak ditemukan.");
  await db.recurringExpense.update({ where: { id }, data: { isActive: !r.isActive } });
  revalidatePath("/admin/recurring");
}

export async function syncRecurringExpenses() {
  const today = new Date();
  const periodMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return;

  const actives = await db.recurringExpense.findMany({ where: { isActive: true } });
  for (const r of actives) {
    if (today.getDate() < r.recurrenceDay) continue;
    if (r.lastGeneratedAt) {
      const lastMonth = r.lastGeneratedAt.toISOString().slice(0, 7);
      if (lastMonth >= periodMonth) continue;
    }
    await db.$transaction([
      db.cashFlow.create({
        data: {
          type: "EXPENSE", source: "RECURRING_EXPENSE",
          categoryId: r.categoryId, amount: r.amount,
          description: `${r.name} - ${periodMonth}`,
          sourceRecurringId: r.id, recordedById: admin.id,
        },
      }),
      db.recurringExpense.update({ where: { id: r.id }, data: { lastGeneratedAt: new Date() } }),
    ]);
  }
}
