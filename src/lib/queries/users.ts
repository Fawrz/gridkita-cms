import { db } from "@/lib/db";
import type { User } from "@/types";

function toUser(u: {
  id: string; email: string; name: string; role: string;
  phone: string | null; bankAccount: string | null; avatarUrl: string | null;
  isActive: boolean; createdAt: Date;
}): User {
  return {
    ...u,
    role: u.role as User["role"],
    phone: u.phone ?? undefined,
    bankAccount: u.bankAccount ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function userById(id: string): Promise<User | undefined> {
  const u = await db.user.findUnique({ where: { id } });
  return u ? toUser(u) : undefined;
}

export async function userByEmail(email: string): Promise<User | undefined> {
  const u = await db.user.findUnique({ where: { email } });
  return u ? toUser(u) : undefined;
}

export async function designers(): Promise<User[]> {
  const list = await db.user.findMany({ where: { role: "DESIGNER" } });
  return list.map(toUser);
}

export async function activeDesigners(): Promise<User[]> {
  const list = await db.user.findMany({ where: { role: "DESIGNER", isActive: true } });
  return list.map(toUser);
}

export async function allUsers(): Promise<User[]> {
  const list = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return list.map(toUser);
}
