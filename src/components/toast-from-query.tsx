"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

const TOAST_MESSAGES: Record<string, string> = {
  "payment-approved": "Pembayaran berhasil di-approve.",
  "payment-rejected": "Pembayaran berhasil di-reject.",
  "order-cancelled": "Pesanan berhasil dibatalkan.",
  "revision-requested": "Permintaan revisi berhasil dikirim.",
  "order-delivered": "Order berhasil dikonfirmasi selesai.",
  "designer-created": "Desainer berhasil ditambahkan.",
  "user-status-updated": "Status user berhasil diubah.",
  "portfolio-deleted": "Portfolio berhasil dihapus.",
  "package-status-updated": "Status paket berhasil diubah.",
  "category-created": "Kategori berhasil ditambahkan.",
  "package-created": "Paket berhasil ditambahkan.",
  "portfolio-created": "Portfolio berhasil ditambahkan.",
  "recurring-created": "Pengeluaran rutin berhasil ditambahkan.",
  "cashflow-created": "Cashflow berhasil dicatat.",
  "recurring-status-updated": "Status pengeluaran rutin berhasil diubah.",
  "recurring-synced": "Recurring expenses berhasil di-sync.",
  "demo-login-failed": "Login demo gagal. Jalankan seed ulang atau cek akun demo.",
};

export function ToastFromQuery() {
  const shownToast = useRef<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const toastKey = url.searchParams.get("toast");
    if (!toastKey || shownToast.current === toastKey) return;

    const message = TOAST_MESSAGES[toastKey];
    if (message) {
      shownToast.current = toastKey;
      toast.success(message);
    }

    url.searchParams.delete("toast");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
