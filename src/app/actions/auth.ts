"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { dashboardPathFor } from "@/lib/session";
import type { Role } from "@/types";

export async function signInWithCredentials(email: string, password: string) {
  await authSignIn("credentials", { email, password, redirectTo: undefined });
  const user = await db.user.findUnique({ where: { email } });
  if (user) redirect(dashboardPathFor(user.role as Role));
}

export async function registerClient(data: {
  name: string; email: string; phone: string; password: string;
}) {
  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error("Email sudah terdaftar.");
  const hash = await bcrypt.hash(data.password, 12);
  await db.user.create({
    data: { email: data.email, password: hash, name: data.name, phone: data.phone, role: "CLIENT" },
  });
  await authSignIn("credentials", { email: data.email, password: data.password, redirectTo: "/dashboard" });
}

export async function signOut() {
  await authSignOut({ redirectTo: "/" });
}
