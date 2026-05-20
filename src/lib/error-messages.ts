export function getUserSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("tidak ditemukan") || msg.includes("not found")) {
      return "Data tidak ditemukan.";
    }
    if (msg.includes("tidak dapat transisi") || msg.includes("status tidak valid")) {
      return "Status order tidak valid untuk aksi ini.";
    }
    if (msg.includes("wajib diisi") || msg.includes("required")) {
      return "Field wajib belum diisi.";
    }
    if (msg.includes("email sudah terdaftar")) {
      return "Email sudah digunakan. Gunakan email lain.";
    }
    if (msg.includes("file") || msg.includes("upload") || msg.includes("ukuran") || msg.includes("format")) {
      return error.message;
    }
    if (msg.includes("password")) {
      return "Password tidak valid.";
    }
    if (msg.includes("bukan status")) {
      return "Status order tidak sesuai untuk aksi ini.";
    }
    if (msg.includes("accrued")) {
      return "Tidak ada entri yang perlu diproses.";
    }
  }

  return "Aksi gagal diproses. Coba lagi.";
}
