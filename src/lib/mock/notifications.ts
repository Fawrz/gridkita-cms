import type { AppNotification } from "@/types";

export const notifications: AppNotification[] = [
  {
    id: "n_001",
    userId: "u_client1",
    type: "ORDER_DONE",
    title: "Pesanan Anda siap di-review",
    message: "Order GK-2026-0001 telah selesai dikerjakan. Silakan cek dan konfirmasi.",
    link: "/dashboard/orders/o_001",
    isRead: false,
    createdAt: "2026-03-11T15:00:00Z",
  },
  {
    id: "n_002",
    userId: "u_client1",
    type: "PAYMENT_VERIFIED",
    title: "Pembayaran terverifikasi",
    message: "Pembayaran untuk order GK-2026-0001 telah disetujui.",
    link: "/dashboard/orders/o_001",
    isRead: true,
    createdAt: "2026-03-01T11:00:00Z",
  },
  {
    id: "n_003",
    userId: "u_designer1",
    type: "ORDER_ASSIGNED",
    title: "Order baru ditugaskan",
    message: "Anda mendapat order GK-2026-0009 — Banner Ads Bootcamp Programming.",
    link: "/designer/tasks/o_009",
    isRead: false,
    createdAt: "2026-03-22T10:00:00Z",
  },
  {
    id: "n_004",
    userId: "u_designer1",
    type: "ORDER_REVISION",
    title: "Klien meminta revisi",
    message: "Order GK-2026-0007 mendapat permintaan revisi (revisi #2).",
    link: "/designer/tasks/o_007",
    isRead: false,
    createdAt: "2026-03-21T15:00:00Z",
  },
  {
    id: "n_005",
    userId: "u_admin",
    type: "PAYMENT_NEW",
    title: "Bukti pembayaran baru",
    message: "Order GK-2026-0003 menunggu verifikasi pembayaran.",
    link: "/admin/payments",
    isRead: false,
    createdAt: "2026-03-22T11:00:00Z",
  },
  {
    id: "n_006",
    userId: "u_admin",
    type: "QUOTE_NEW",
    title: "Permintaan kustom baru",
    message: "Klien Amelia Putri mengajukan permintaan kustom Visual Wisuda.",
    link: "/admin/quotes",
    isRead: false,
    createdAt: "2026-03-24T09:00:00Z",
  },
  {
    id: "n_007",
    userId: "u_admin",
    type: "ORDER_NEW",
    title: "Order baru masuk",
    message: "Order GK-2026-0010 — Story Template UMKM Snack telah masuk dan dibayar.",
    link: "/admin/orders/o_010",
    isRead: true,
    createdAt: "2026-03-23T13:00:00Z",
  },
];

export function notificationsByUser(userId: string): AppNotification[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadCount(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.isRead).length;
}
