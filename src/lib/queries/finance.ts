import { db } from "@/lib/db";
import type { PayrollEntry, PayoutBatch, RecurringExpense, CashFlow, ExpenseCategory } from "@/types";

export async function payrollEntries(): Promise<PayrollEntry[]> {
  const list = await db.payrollEntry.findMany({ orderBy: { accruedAt: "desc" } });
  return list.map((e) => ({
    id: e.id, orderId: e.orderId, designerId: e.designerId,
    orderTotal: Number(e.orderTotal),
    commissionAmount: Number(e.commissionAmount),
    companyShare: Number(e.companyShare),
    status: e.status as PayrollEntry["status"],
    accruedAt: e.accruedAt.toISOString(),
    paidOutAt: e.paidOutAt?.toISOString(),
    payoutBatchId: e.payoutBatchId ?? undefined,
  }));
}

export async function payoutBatches(): Promise<PayoutBatch[]> {
  const list = await db.payoutBatch.findMany({
    include: { entries: { select: { id: true } } },
    orderBy: { processedAt: "desc" },
  });
  return list.map((b) => ({
    id: b.id, periodMonth: b.periodMonth, totalAmount: Number(b.totalAmount),
    processedById: b.processedById, processedAt: b.processedAt.toISOString(),
    note: b.note ?? undefined, entryIds: b.entries.map((e) => e.id),
  }));
}

export async function expenseCategories(): Promise<ExpenseCategory[]> {
  return db.expenseCategory.findMany();
}

export async function recurringExpenses(): Promise<RecurringExpense[]> {
  const list = await db.recurringExpense.findMany({ orderBy: { name: "asc" } });
  return list.map((r) => ({
    id: r.id, categoryId: r.categoryId, name: r.name,
    amount: Number(r.amount), recurrenceDay: r.recurrenceDay,
    isActive: r.isActive, lastGeneratedAt: r.lastGeneratedAt?.toISOString(),
  }));
}

export async function cashFlows(): Promise<CashFlow[]> {
  const list = await db.cashFlow.findMany({ orderBy: { occurredAt: "desc" } });
  return list.map((c) => ({
    id: c.id, type: c.type as CashFlow["type"],
    source: c.source as CashFlow["source"],
    categoryId: c.categoryId ?? undefined,
    amount: Number(c.amount), description: c.description,
    occurredAt: c.occurredAt.toISOString(),
    sourceOrderId: c.sourceOrderId ?? undefined,
    sourceRecurringId: c.sourceRecurringId ?? undefined,
    recordedById: c.recordedById,
  }));
}

export async function commissionByDesigner(designerId: string, periodPrefix?: string): Promise<number> {
  const list = await db.payrollEntry.findMany({
    where: periodPrefix
      ? { designerId, accruedAt: { gte: new Date(periodPrefix + "-01") } }
      : { designerId },
  });
  return list.reduce((s, e) => s + Number(e.commissionAmount), 0);
}

export async function payoutsByDesigner(designerId: string): Promise<PayrollEntry[]> {
  const list = await db.payrollEntry.findMany({
    where: { designerId }, orderBy: { accruedAt: "desc" },
  });
  return list.map((e) => ({
    id: e.id, orderId: e.orderId, designerId: e.designerId,
    orderTotal: Number(e.orderTotal), commissionAmount: Number(e.commissionAmount),
    companyShare: Number(e.companyShare), status: e.status as PayrollEntry["status"],
    accruedAt: e.accruedAt.toISOString(), paidOutAt: e.paidOutAt?.toISOString(),
    payoutBatchId: e.payoutBatchId ?? undefined,
  }));
}
