import type { OrderStatus } from "@/types";
import { orders } from "@/lib/mock/orders";
import { cashFlows, expenseCategories, payrollEntries } from "@/lib/mock/finance";
import { users } from "@/lib/mock/users";
import { STATUS_LABEL } from "@/lib/state-machine";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

export const monthlyFinance = MONTHS.map((month, idx) => {
  const monthKey = `2026-${String(idx + 1).padStart(2, "0")}`;
  const flows = cashFlows.filter((c) => c.occurredAt.startsWith(monthKey));
  const income = flows.filter((c) => c.type === "INCOME" && c.source === "ORDER_PAYMENT").reduce((s, c) => s + c.amount, 0);
  const expense = flows.filter((c) => c.type === "EXPENSE").reduce((s, c) => s + c.amount, 0);
  return {
    month,
    pemasukan: income || [1_100_000, 1_350_000, 1_425_000, 0, 0, 0][idx],
    pengeluaran: expense || [260_000, 195_000, 590_000, 0, 0, 0][idx],
  };
});

export const expenseBreakdown = expenseCategories.map((cat) => ({
  name: cat.name,
  value: cashFlows
    .filter((c) => c.type === "EXPENSE" && c.categoryId === cat.id)
    .reduce((s, c) => s + c.amount, 0),
})).filter((x) => x.value > 0);

export const designerRanking = users
  .filter((u) => u.role === "DESIGNER")
  .map((u) => ({
    name: u.name.split(" ")[0],
    komisi: payrollEntries.filter((p) => p.designerId === u.id).reduce((s, p) => s + p.commissionAmount, 0),
  }))
  .sort((a, b) => b.komisi - a.komisi);

export const orderFunnel = (Object.keys(STATUS_LABEL) as OrderStatus[]).map((status) => ({
  status: STATUS_LABEL[status],
  jumlah: orders.filter((o) => o.status === status).length,
})).filter((x) => x.jumlah > 0);

export const adminKpis = {
  revenue: orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.finalPrice, 0),
  activeOrders: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
  waitingPayments: orders.filter((o) => o.status === "WAITING_VERIFICATION").length,
  accruedPayroll: payrollEntries.filter((p) => p.status === "ACCRUED").reduce((s, p) => s + p.commissionAmount, 0),
};
