import { Pencil, Plus, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { EntityCard } from "@/components/entity-card";
import { ActionIconButton } from "@/components/action-icon-button";
import { FormField } from "@/components/form-field";
import { allUsers } from "@/lib/queries/users";
import { allOrders } from "@/lib/queries/orders";
import { commissionByDesigner } from "@/lib/queries/finance";
import { formatDate, formatIDR } from "@/lib/format";
import { createDesigner, toggleUserActive } from "@/app/actions/cms";

export default async function AdminUsersPage() {
  const [usersList, ordersList] = await Promise.all([
    allUsers(),
    allOrders(),
  ]);
  const commissionPromises = usersList
    .filter(u => u.role === "DESIGNER")
    .map(u => commissionByDesigner(u.id));
  const commissions = await Promise.all(commissionPromises);
  const commissionMap = new Map(
    usersList
      .filter(u => u.role === "DESIGNER")
      .map((u, i) => [u.id, commissions[i]])
  );
  const workloadMap = new Map(
    usersList
      .filter(u => u.role === "DESIGNER")
      .map(u => [
        u.id,
        ordersList.filter(o => o.designerId === u.id && !["DELIVERED", "CANCELLED"].includes(o.status)).length
      ])
  );

  async function handleCreateDesigner(formData: FormData) {
    "use server";
    const data = {
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      bankAccount: String(formData.get("bankAccount") || undefined),
    };
    await createDesigner(data);
  }

  async function handleToggleUser(formData: FormData) {
    "use server";
    const userId = String(formData.get("userId"));
    await toggleUserActive(userId);
  }

  return (
    <>
      <PageHeader title="Manajemen User" description="Buat akun desainer baru dan nonaktifkan akun yang tidak aktif." actions={<UserDialog action={handleCreateDesigner} />} />

      <div className="grid gap-3 md:hidden">
        {usersList.map((u) => {
          const workload = workloadMap.get(u.id) ?? null;
          const commission = commissionMap.get(u.id) ?? null;
          return (
            <EntityCard
              key={u.id}
              title={u.name}
              eyebrow={u.email}
              status={<Badge variant={u.isActive ? "success" : "inactive"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge>}
              meta={<><Badge variant={u.role === "ADMIN" ? "default" : "outline"}>{u.role}</Badge><span className="ml-2">Joined {formatDate(u.createdAt)}</span></>}
              value={u.role === "DESIGNER" ? `${workload} aktif / ${formatIDR(commission ?? 0)}` : "Admin"}
            />
          );
        })}
      </div>

      <Card className="hidden md:flex">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Workload/Komisi</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {usersList.map((u) => {
                  const workload = workloadMap.get(u.id) ?? null;
                  const commission = commissionMap.get(u.id) ?? null;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={u.avatarUrl} alt={u.name} />
                            <AvatarFallback>{u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={u.role === "ADMIN" ? "default" : "outline"}>{u.role}</Badge></td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3"><Badge variant={u.isActive ? "success" : "inactive"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        {u.role === "DESIGNER" ? (
                          <>
                            <div className="font-medium">{workload} aktif</div>
                            <div className="text-xs text-muted-foreground tabular-nums">{formatIDR(commission ?? 0)}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Admin</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <UserDialog action={handleCreateDesigner} editName={u.name} />
                          <form action={handleToggleUser}>
                            <input type="hidden" name="userId" value={u.id} />
                            <ActionIconButton type="submit" label={`${u.isActive ? "Nonaktifkan" : "Aktifkan"} ${u.name}`}>
                              <Power className="size-4" aria-hidden="true" />
                            </ActionIconButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function UserDialog({
  action,
  editName,
}: {
  action: (formData: FormData) => Promise<void>;
  editName?: string;
}) {
  const suffix = editName ? "edit" : "new";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={editName ? "icon-sm" : "default"} variant={editName ? "outline" : "default"} aria-label={editName ? `Edit ${editName}` : undefined}>
          {editName ? <Pencil className="size-4" /> : <><Plus className="size-4" /> Tambah Designer</>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editName ? "Edit user" : "Tambah akun desainer"}</DialogTitle></DialogHeader>
        <form action={action} className="space-y-4">
          <FormField id={`user-name-${suffix}`} label="Nama"><Input name="name" defaultValue={editName ?? ""} /></FormField>
          <FormField id={`user-email-${suffix}`} label="Email"><Input name="email" type="email" placeholder="designer@gridkita.id" /></FormField>
          {!editName && <FormField id={`user-password-${suffix}`} label="Password"><Input name="password" type="password" placeholder="••••••••" /></FormField>}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select name="role" defaultValue="DESIGNER">
              <SelectTrigger aria-label="Role user"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="DESIGNER">DESIGNER</SelectItem><SelectItem value="ADMIN">ADMIN</SelectItem></SelectContent>
            </Select>
          </div>
          <FormField id={`user-bank-${suffix}`} label="Rekening"><Input name="bankAccount" placeholder="BCA 123... a.n. ..." /></FormField>
          <SubmitButton loadingText="Menyimpan..." className="w-full">Simpan</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
