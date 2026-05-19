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

export async function createCategory(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name"));
  const slug = String(formData.get("slug"));
  const description = String(formData.get("description") || "");
  if (!name || !slug) throw new Error("Nama dan slug wajib diisi.");
  await db.serviceCategory.create({ data: { name, slug, description } });
  revalidatePath("/admin/catalog");
}

export async function createPackage(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name"));
  const categoryId = String(formData.get("categoryId"));
  const price = Number(formData.get("price") || 0);
  const estimatedDays = Number(formData.get("estimatedDays") || 1);
  const description = String(formData.get("description") || "");
  const featuresRaw = String(formData.get("features") || "");
  const features = featuresRaw.split("\n").map((f: string) => f.trim()).filter(Boolean);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!name || !categoryId) throw new Error("Nama dan kategori wajib diisi.");
  await db.servicePackage.create({
    data: { name, slug, categoryId, description, features, basePrice: price, estimatedDays, thumbnailPath: "" },
  });
  revalidatePath("/admin/catalog");
}

export async function createPortfolio(formData: FormData) {
  const me = await requireRole("ADMIN");
  const title = String(formData.get("title"));
  const category = String(formData.get("category") || "");
  const description = String(formData.get("description") || "");
  if (!title) throw new Error("Judul wajib diisi.");
  await db.portfolio.create({ data: { title, category, description, createdById: me.id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function createRecurringExpense(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name"));
  const categoryId = String(formData.get("category"));
  const amount = Number(formData.get("amount") || 0);
  const recurrenceDay = Number(formData.get("day") || 1);
  if (!name || !categoryId) throw new Error("Nama dan kategori wajib diisi.");
  await db.recurringExpense.create({ data: { name, categoryId, amount, recurrenceDay } });
  revalidatePath("/admin/recurring");
}
