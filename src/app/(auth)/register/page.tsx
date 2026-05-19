import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAs } from "@/app/actions/auth";

export default function RegisterPage() {
  async function registerAction() {
    "use server";
    // Mock: anggap registrasi berhasil & login as klien default
    await signInAs("u_client1");
  }

  return (
    <Card className="border-muted/60 shadow-xl shadow-primary/8">
      <CardContent className="p-7">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Daftar Akun Klien</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pendaftaran publik hanya untuk peran Klien. Akun desainer dibuat oleh admin.
          </p>
        </div>
        <form action={registerAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama lengkap</Label>
            <Input id="name" name="name" placeholder="Nama lengkap Anda" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="anda@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input id="phone" name="phone" type="tel" placeholder="0812-xxxx-xxxx" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Min. 8 karakter" required />
            <p className="text-[11px] text-muted-foreground">
              Demo: password tidak disimpan (mock front-end).
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Buat akun & masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
