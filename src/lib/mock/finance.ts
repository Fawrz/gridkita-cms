import type {
  PayrollEntry,
  PayoutBatch,
  ExpenseCategory,
  RecurringExpense,
  CashFlow,
} from "@/types";
import { calculateSplit } from "@/lib/payroll";
import { orders } from "@/lib/mock/orders";

// PayrollEntry hanya untuk order DELIVERED (PRD §4.5)
export const payrollEntries: PayrollEntry[] = orders
  .filter((o) => o.status === "DELIVERED" && o.designerId)
  .map((o, idx) => {
    const split = calculateSplit(o.finalPrice);
    return {
      id: `pe_${String(idx + 1).padStart(3, "0")}`,
      orderId: o.id,
      designerId: o.designerId!,
      orderTotal: o.finalPrice,
      commissionAmount: split.designerShare,
      companyShare: split.companyShare,
      status: idx === 0 ? "PAID_OUT" : "ACCRUED",
      accruedAt: o.updatedAt,
      paidOutAt: idx === 0 ? "2026-02-28T15:00:00Z" : undefined,
      payoutBatchId: idx === 0 ? "pb_001" : undefined,
    };
  });

export const payoutBatches: PayoutBatch[] = [
  {
    id: "pb_001",
    periodMonth: "2026-02",
    totalAmount: payrollEntries
      .filter((e) => e.status === "PAID_OUT")
      .reduce((s, e) => s + e.commissionAmount, 0),
    processedById: "u_admin",
    processedAt: "2026-02-28T15:00:00Z",
    note: "Payout batch Februari 2026",
    entryIds: payrollEntries.filter((e) => e.status === "PAID_OUT").map((e) => e.id),
  },
];

export const expenseCategories: ExpenseCategory[] = [
  { id: "ec_op", name: "Operasional", isOperational: true },
  { id: "ec_software", name: "Software & Lisensi", isOperational: true },
  { id: "ec_marketing", name: "Marketing", isOperational: false },
  { id: "ec_alat", name: "Alat & Perlengkapan", isOperational: false },
  { id: "ec_lain", name: "Lain-lain", isOperational: false },
];

export const recurringExpenses: RecurringExpense[] = [
  {
    id: "re_wifi",
    categoryId: "ec_op",
    name: "WiFi Indihome",
    amount: 180_000,
    recurrenceDay: 5,
    isActive: true,
    lastGeneratedAt: "2026-03-05T08:00:00Z",
  },
  {
    id: "re_software",
    categoryId: "ec_software",
    name: "Adobe Creative Cloud (1 seat)",
    amount: 15_000,
    recurrenceDay: 1,
    isActive: true,
    lastGeneratedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "re_canva",
    categoryId: "ec_software",
    name: "Canva Pro",
    amount: 60_000,
    recurrenceDay: 10,
    isActive: true,
    lastGeneratedAt: "2026-03-10T08:00:00Z",
  },
];

// Bangun cashflow dari order DELIVERED + recurring + manual
const orderCashFlows: CashFlow[] = orders
  .filter((o) => o.status === "DELIVERED")
  .flatMap((o, idx) => {
    const split = calculateSplit(o.finalPrice);
    return [
      {
        id: `cf_o${idx}_in`,
        type: "INCOME" as const,
        source: "ORDER_PAYMENT" as const,
        amount: o.finalPrice,
        description: `Pembayaran order ${o.code}`,
        occurredAt: o.updatedAt,
        sourceOrderId: o.id,
        recordedById: "u_admin",
      },
      {
        id: `cf_o${idx}_share`,
        type: "INCOME" as const,
        source: "COMMISSION_SHARE" as const,
        amount: split.companyShare,
        description: `Bagian perusahaan (30%) ${o.code}`,
        occurredAt: o.updatedAt,
        sourceOrderId: o.id,
        recordedById: "u_admin",
      },
    ];
  });

const recurringCashFlows: CashFlow[] = [
  {
    id: "cf_re_wifi_03",
    type: "EXPENSE",
    source: "RECURRING_EXPENSE",
    categoryId: "ec_op",
    amount: 180_000,
    description: "WiFi Indihome - Maret 2026",
    occurredAt: "2026-03-05T08:00:00Z",
    sourceRecurringId: "re_wifi",
    recordedById: "u_admin",
  },
  {
    id: "cf_re_adobe_03",
    type: "EXPENSE",
    source: "RECURRING_EXPENSE",
    categoryId: "ec_software",
    amount: 15_000,
    description: "Adobe Creative Cloud - Maret 2026",
    occurredAt: "2026-03-01T08:00:00Z",
    sourceRecurringId: "re_software",
    recordedById: "u_admin",
  },
  {
    id: "cf_re_canva_03",
    type: "EXPENSE",
    source: "RECURRING_EXPENSE",
    categoryId: "ec_software",
    amount: 60_000,
    description: "Canva Pro - Maret 2026",
    occurredAt: "2026-03-10T08:00:00Z",
    sourceRecurringId: "re_canva",
    recordedById: "u_admin",
  },
  {
    id: "cf_re_wifi_02",
    type: "EXPENSE",
    source: "RECURRING_EXPENSE",
    categoryId: "ec_op",
    amount: 180_000,
    description: "WiFi Indihome - Februari 2026",
    occurredAt: "2026-02-05T08:00:00Z",
    sourceRecurringId: "re_wifi",
    recordedById: "u_admin",
  },
  {
    id: "cf_re_adobe_02",
    type: "EXPENSE",
    source: "RECURRING_EXPENSE",
    categoryId: "ec_software",
    amount: 15_000,
    description: "Adobe CC - Februari 2026",
    occurredAt: "2026-02-01T08:00:00Z",
    sourceRecurringId: "re_software",
    recordedById: "u_admin",
  },
];

const manualCashFlows: CashFlow[] = [
  {
    id: "cf_m_001",
    type: "EXPENSE",
    source: "MANUAL",
    categoryId: "ec_alat",
    amount: 85_000,
    description: "Beli kertas A3 untuk mockup",
    occurredAt: "2026-03-12T11:00:00Z",
    recordedById: "u_admin",
  },
  {
    id: "cf_m_002",
    type: "EXPENSE",
    source: "MANUAL",
    categoryId: "ec_marketing",
    amount: 250_000,
    description: "Iklan IG promo paket Logo Pro",
    occurredAt: "2026-03-15T09:00:00Z",
    recordedById: "u_admin",
  },
];

export const cashFlows: CashFlow[] = [
  ...orderCashFlows,
  ...recurringCashFlows,
  ...manualCashFlows,
].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

export function commissionByDesigner(designerId: string, period?: string): number {
  return payrollEntries
    .filter((e) => e.designerId === designerId)
    .filter((e) => !period || e.accruedAt.startsWith(period))
    .reduce((s, e) => s + e.commissionAmount, 0);
}

export function payoutsByDesigner(designerId: string) {
  return payrollEntries
    .filter((e) => e.designerId === designerId)
    .sort((a, b) => b.accruedAt.localeCompare(a.accruedAt));
}
