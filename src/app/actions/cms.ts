"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDesigner(data: {
  name: string; email: string; password: string; bankAccount?: string;
}) {
  await requireRole("ADMIN");
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash(data.password, 12);
  await db.user.create({
    data: { name: data.name, email: data.email, password: hash, role: "DESIGNER", bankAccount: data.bankAccount },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserActive(userId: string) {
  await requireRole("ADMIN");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User tidak ditemukan.");
  await db.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/users");
}

export async function deletePortfolio(portfolioId: string) {
  await requireRole("ADMIN");
  await db.portfolio.delete({ where: { id: portfolioId } });
  revalidatePath("/admin/portfolio");
}

export async function togglePackageActive(packageId: string) {
  await requireRole("ADMIN");
  const pkg = await db.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg) throw new Error("Paket tidak ditemukan.");
  await db.servicePackage.update({ where: { id: packageId }, data: { isActive: !pkg.isActive } });
  revalidatePath("/admin/catalog");
}
