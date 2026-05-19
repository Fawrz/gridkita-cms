import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { signInWithEmail, signInAs } from "@/app/actions/auth";
import { users } from "@/lib/mock/users";

export default function LoginPage() {
  const demoAccounts = [
    { id: "u_admin", email: "admin@gridkita.id", role: "Admin" },
    { id: "u_designer1", email: "wahyu@gridkita.id", role: "Designer" },
    { id: "u_client1", email: "rifat@example.com", role: "Klien" },
  ];

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    await signInWithEmail(email);
  }

  async function quickLogin(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    await signInAs(id);
  }

  return (
    <Card className="border-muted/60 shadow-xl shadow-primary/8">
      <CardContent className="p-6 sm:p-7">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Masuk ke GridKita</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Login untuk akses dashboard sesuai peran Anda.
          </p>
        </div>
        <form action={loginAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="anda@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Lupa password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" placeholder="Password demo" autoComplete="current-password" />
            <p className="text-xs text-muted-foreground">
              Demo: password tidak divalidasi (mock front-end).
            </p>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Masuk
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          atau coba akun demo
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid gap-2">
          {demoAccounts.map((d) => {
            const u = users.find((x) => x.id === d.id)!;
            return (
              <form key={d.id} action={quickLogin}>
                <input type="hidden" name="id" value={d.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-auto w-full justify-between gap-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{d.role}</Badge>
                    <span className="truncate">{u.name}</span>
                  </span>
                  <span className="min-w-0 truncate text-xs text-muted-foreground">{d.email}</span>
                </Button>
              </form>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Daftar sebagai klien
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
