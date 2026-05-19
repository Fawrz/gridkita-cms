import { db } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/state-machine";
import type { OrderStatus } from "@/types";

export async function adminKpis() {
  const [revenue, activeOrders, waitingPayments, accruedPayroll] = await Promise.all([
    db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { finalPrice: true } }),
    db.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    db.order.count({ where: { status: "WAITING_VERIFICATION" } }),
    db.payrollEntry.aggregate({ where: { status: "ACCRUED" }, _sum: { commissionAmount: true } }),
  ]);
  return {
    revenue: Number(revenue._sum.finalPrice ?? 0),
    activeOrders,
    waitingPayments,
    accruedPayroll: Number(accruedPayroll._sum.commissionAmount ?? 0),
  };
}

export async function monthlyFinance() {
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun"];
  const year = new Date().getFullYear();
  return Promise.all(
    MONTHS.map(async (month, idx) => {
      const from = new Date(year, idx, 1);
      const to = new Date(year, idx + 1, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        db.cashFlow.aggregate({ where: { type: "INCOME", source: "ORDER_PAYMENT", occurredAt: { gte: from, lte: to } }, _sum: { amount: true } }),
        db.cashFlow.aggregate({ where: { type: "EXPENSE", occurredAt: { gte: from, lte: to } }, _sum: { amount: true } }),
      ]);
      return { month, pemasukan: Number(inc._sum.amount ?? 0), pengeluaran: Number(exp._sum.amount ?? 0) };
    })
  );
}

export async function designerRanking() {
  const designers = await db.user.findMany({ where: { role: "DESIGNER" } });
  return Promise.all(
    designers.map(async (d) => {
      const agg = await db.payrollEntry.aggregate({ where: { designerId: d.id }, _sum: { commissionAmount: true } });
      return { name: d.name.split(" ")[0], komisi: Number(agg._sum.commissionAmount ?? 0) };
    })
  ).then((r) => r.sort((a, b) => b.komisi - a.komisi));
}

export async function orderFunnel() {
  const statuses = Object.keys(STATUS_LABEL) as OrderStatus[];
  return Promise.all(
    statuses.map(async (status) => {
      const jumlah = await db.order.count({ where: { status } });
      return { status: STATUS_LABEL[status], jumlah };
    })
  ).then((r) => r.filter((x) => x.jumlah > 0));
}
