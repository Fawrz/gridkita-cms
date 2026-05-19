import { Plus, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EntityCard } from "@/components/entity-card";
import { requireRole } from "@/lib/session";
import { recurringExpenses, expenseCategories } from "@/lib/queries/finance";
import { formatIDR, formatDate } from "@/lib/format";
import { CalendarClock, Repeat, RefreshCw } from "lucide-react";
import { toggleRecurring, syncRecurringExpenses } from "@/app/actions/cashflow";

export default async function AdminRecurringPage() {
  await requireRole("ADMIN");

  async function noopAction() {
    "use server";
  }
  async function handleToggleRecurring(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await toggleRecurring(id);
  }

  async function handleSyncRecurring() {
    "use server";
    await syncRecurringExpenses();
  }

  const [recurringExpensesList, expenseCategoriesList] = await Promise.all([
    recurringExpenses(),
    expenseCategories(),
  ]);
  const activeList = recurringExpensesList.filter((r) => r.isActive);
  const monthlyTotal = activeList.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <PageHeader
        title="Pengeluaran Rutin"
        description="Template pengeluaran berulang otomatis (WiFi, software). Bersifat idempoten: aman dipanggil berkali-kali."
        actions={
          <div className="flex gap-2">
            <form action={handleSyncRecurring}>
              <Button type="submit" variant="outline">
                <RefreshCw className="size-4 mr-1.5" /> Sync Recurring
              </Button>
            </form>
            <RecurringDialog action={noopAction} categories={expenseCategoriesList} />
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Per Bulan"
          value={formatIDR(monthlyTotal)}
          icon={CalendarClock}
          tone="warning"
          hint={`${activeList.length} pengeluaran aktif`}
        />
        <StatCard
          label="Total Items"
          value={recurringExpensesList.length}
          icon={Repeat}
          hint={`${recurringExpensesList.filter((r) => !r.isActive).length} nonaktif`}
        />
        <StatCard
          label="Estimasi Tahunan"
          value={formatIDR(monthlyTotal * 12)}
          tone="info"
        />
      </div>

      <div className="grid gap-3 md:hidden">
        {recurringExpensesList.map((r) => {
          const cat = expenseCategoriesList.find((c) => c.id === r.categoryId);
          return (
            <EntityCard
              key={r.id}
              title={r.name}
              eyebrow={cat?.name ?? "Tanpa kategori"}
              status={<Badge variant={r.isActive ? "success" : "inactive"}>{r.isActive ? "Aktif" : "Nonaktif"}</Badge>}
              meta={`Tagihan tiap tanggal ${String(r.recurrenceDay).padStart(2, "0")} / terakhir: ${r.lastGeneratedAt ? formatDate(r.lastGeneratedAt) : "belum ada"}`}
              value={formatIDR(r.amount)}
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
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium text-center">Tgl Tagihan</th>
                  <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    Terakhir Generate
                  </th>
                  <th className="px-4 py-3 font-medium text-center">Aktif</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {recurringExpensesList.map((r) => {
                  const cat = expenseCategoriesList.find((c) => c.id === r.categoryId);
                  return (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{cat?.name ?? "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums font-mono">
                        {String(r.recurrenceDay).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatIDR(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {r.lastGeneratedAt ? formatDate(r.lastGeneratedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <form action={handleToggleRecurring}>
                          <input type="hidden" name="id" value={r.id} />
                          <Switch
                            defaultChecked={r.isActive}
                            aria-label={`Toggle ${r.name}`}
                          />
                        </form>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RecurringDialog action={noopAction} editItem={r} categories={expenseCategoriesList} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Info:</strong> Generator recurring expense bersifat{" "}
        <span className="font-medium">idempoten</span> — cek{" "}
        <code className="bg-muted px-1 rounded text-xs">lastGeneratedAt &lt; bulan berjalan</code>{" "}
        sebelum insert. Aman dipanggil otomatis saat admin membuka dashboard (PRD §4.5).
      </div>
    </>
  );
}

function RecurringDialog({
  action,
  editItem,
  categories,
}: {
  action: () => Promise<void>;
  editItem?: { name: string; amount: number; recurrenceDay: number; categoryId: string };
  categories: Array<{ id: string; name: string }>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={editItem ? "icon-sm" : "default"}
          variant={editItem ? "outline" : "default"}
          aria-label={editItem ? `Edit ${editItem.name}` : undefined}
        >
          {editItem ? (
            <Pencil className="size-4" />
          ) : (
            <>
              <Plus className="size-4 mr-1.5" /> Tambah
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editItem ? "Edit pengeluaran rutin" : "Tambah pengeluaran rutin"}
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input
              name="name"
              defaultValue={editItem?.name ?? ""}
              placeholder="cth. WiFi Indihome"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select name="category" defaultValue={editItem?.categoryId ?? ""}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jumlah (Rp)</Label>
              <Input
                type="number"
                name="amount"
                defaultValue={editItem?.amount ?? ""}
                placeholder="cth. 180000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal tagihan (1–28)</Label>
              <Input
                type="number"
                name="day"
                min={1}
                max={28}
                defaultValue={editItem?.recurrenceDay ?? 1}
              />
              <p className="text-[11px] text-muted-foreground">
                CashFlow di-generate saat hari ≥ tanggal ini.
              </p>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
