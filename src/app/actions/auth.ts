"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, dashboardPathFor } from "@/lib/auth-mock";
import { users, userById } from "@/lib/mock/users";

export async function signInAs(userId: string) {
  const u = userById(userId);
  if (!u) throw new Error("User tidak ditemukan");
  const c = await cookies();
  c.set(AUTH_COOKIE, userId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(dashboardPathFor(u.role));
}

export async function signInWithEmail(email: string) {
  // Mock: pick first user matching email; demo accounts are seeded
  const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) throw new Error("Email tidak terdaftar di akun demo");
  await signInAs(u.id);
}

export async function signOut() {
  const c = await cookies();
  c.delete(AUTH_COOKIE);
  redirect("/");
}
