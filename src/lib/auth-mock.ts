import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { users, userById } from "@/lib/mock/users";
import type { Role, User } from "@/types";

export const AUTH_COOKIE = "gk_user_id";

export async function getCurrentUser(): Promise<User | null> {
  const c = await cookies();
  const id = c.get(AUTH_COOKIE)?.value;
  if (!id) return null;
  return userById(id) ?? null;
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
    case "ADMIN":
      return "/admin";
    case "DESIGNER":
      return "/designer";
    case "CLIENT":
      return "/dashboard";
  }
}

export const allUsers = users;
