import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { User } from "@/types";

export function ProfileForm({
  me,
  showBank = false,
}: {
  me: User;
  showBank?: boolean;
}) {
  async function save() {
    "use server";
    redirect("?saved=1");
  }
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="size-16">
            <AvatarImage src={me.avatarUrl} alt={me.name} />
            <AvatarFallback className="text-lg">
              {me.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{me.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{me.role}</Badge>
              <span className="text-xs text-muted-foreground">
                Bergabung {new Date(me.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
        <Separator className="mb-6" />
        <form action={save} className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama lengkap</Label>
            <Input id="name" name="name" defaultValue={me.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={me.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input id="phone" name="phone" defaultValue={me.phone ?? ""} />
          </div>
          {showBank && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="bank">Rekening untuk pencairan komisi</Label>
              <Input
                id="bank"
                name="bank"
                placeholder="Bank Nama Rek 1234567890 a.n. ..."
                defaultValue={me.bankAccount ?? ""}
              />
            </div>
          )}
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit">Simpan perubahan</Button>
            <Button type="reset" variant="ghost">
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
