"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { dashboardPathFor } from "@/lib/session";
import type { Role } from "@/types";

const DEMO_ACCOUNTS: Record<string, { password: string; role: Role }> = {
  "admin@gridkita.id": { password: "gridkita2026", role: "ADMIN" },
  "arka@gridkita.id": { password: "designer123", role: "DESIGNER" },
  "nara@gridkita.id": { password: "designer123", role: "DESIGNER" },
  "tara@example.com": { password: "client123", role: "CLIENT" },
  "nesya@example.com": { password: "client123", role: "CLIENT" },
  "gilang@example.com": { password: "client123", role: "CLIENT" },
};

export async function signInWithCredentials(email: string, password: string) {
  const result = await authSignIn("credentials", { email, password, redirect: false });
  if (result?.error) throw new Error("Login gagal");
  const user = await db.user.findUnique({ where: { email } });
  if (user) redirect(dashboardPathFor(user.role as Role));
}

export async function switchDemoAccount(email: string) {
  const demo = DEMO_ACCOUNTS[email];
  if (!demo) redirect("/login?toast=demo-login-failed");

  const result = await authSignIn("credentials", {
    email,
    password: demo.password,
    redirect: false,
  });
  if (result?.error) redirect("/login?toast=demo-login-failed");

  redirect(dashboardPathFor(demo.role));
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
