import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role, User } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = await db.user.findUnique({ where: { id: session.user.id } });
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name,
    role: u.role as Role, phone: u.phone ?? undefined,
    bankAccount: u.bankAccount ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    isActive: u.isActive, createdAt: u.createdAt.toISOString(),
  };
}

export async function requireRole(role: Role | Role[]): Promise<User> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(u.role)) redirect("/login");
  return u;
}

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "DESIGNER": return "/designer";
    case "CLIENT": return "/dashboard";
  }
}
