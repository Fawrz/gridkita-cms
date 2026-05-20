import type { OrderStatus, Role } from "@/types";

// PRD §4.3 — state machine transition (pure function)
type Transition = {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: Role[];
};

export const TRANSITIONS: Transition[] = [
  { from: "QUOTE_REQUESTED", to: "QUOTE_OFFERED", allowedRoles: ["ADMIN"] },
  { from: "QUOTE_REQUESTED", to: "CANCELLED", allowedRoles: ["ADMIN", "CLIENT"] },
  { from: "QUOTE_OFFERED", to: "PENDING_PAYMENT", allowedRoles: ["CLIENT"] },
  { from: "QUOTE_OFFERED", to: "CANCELLED", allowedRoles: ["CLIENT"] },
  { from: "PENDING_PAYMENT", to: "WAITING_VERIFICATION", allowedRoles: ["CLIENT"] },
  { from: "PENDING_PAYMENT", to: "CANCELLED", allowedRoles: ["CLIENT"] },
  { from: "WAITING_VERIFICATION", to: "PAID", allowedRoles: ["ADMIN"] },
  { from: "WAITING_VERIFICATION", to: "PENDING_PAYMENT", allowedRoles: ["ADMIN"] },
  { from: "PAID", to: "ASSIGNED", allowedRoles: ["ADMIN"] },
  { from: "ASSIGNED", to: "IN_PROGRESS", allowedRoles: ["DESIGNER"] },
  { from: "IN_PROGRESS", to: "REVISION", allowedRoles: ["DESIGNER"] },
  { from: "IN_PROGRESS", to: "DONE", allowedRoles: ["DESIGNER"] },
  { from: "REVISION", to: "IN_PROGRESS", allowedRoles: ["DESIGNER"] },
  { from: "REVISION", to: "DONE", allowedRoles: ["DESIGNER"] },
  { from: "DONE", to: "DELIVERED", allowedRoles: ["CLIENT", "ADMIN"] },
  { from: "DONE", to: "REVISION", allowedRoles: ["CLIENT", "ADMIN"] },
];

export const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED"];

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  role: Role
): boolean {
  return TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.allowedRoles.includes(role)
  );
}

export function nextStatuses(from: OrderStatus, role: Role): OrderStatus[] {
  return TRANSITIONS.filter((t) => t.from === from && t.allowedRoles.includes(role)).map(
    (t) => t.to
  );
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  QUOTE_REQUESTED: "Menunggu Quote",
  QUOTE_OFFERED: "Quote Diterima",
  PENDING_PAYMENT: "Menunggu Pembayaran",
  WAITING_VERIFICATION: "Verifikasi Pembayaran",
  PAID: "Sudah Dibayar",
  ASSIGNED: "Ditugaskan",
  IN_PROGRESS: "Dikerjakan",
  REVISION: "Revisi",
  DONE: "Selesai (Review)",
  DELIVERED: "Terkirim",
  CANCELLED: "Dibatalkan",
};

export const STATUS_TONE: Record<OrderStatus, "neutral" | "info" | "warn" | "ok" | "bad" | "primary" | "coral"> = {
  QUOTE_REQUESTED: "warn",
  QUOTE_OFFERED: "warn",
  PENDING_PAYMENT: "info",
  WAITING_VERIFICATION: "info",
  PAID: "primary",
  ASSIGNED: "primary",
  IN_PROGRESS: "primary",
  REVISION: "coral",
  DONE: "coral",
  DELIVERED: "ok",
  CANCELLED: "bad",
};
