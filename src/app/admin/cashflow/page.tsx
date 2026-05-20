import { Plus, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { requireRole } from "@/lib/session";
import { cashFlows, expenseCategories } from "@/lib/queries/finance";
import { formatIDR, formatDate } from "@/lib/format";
import { addManualCashFlow } from "@/app/actions/cashflow";

const SOURCE_LABEL: Record<string, string> = {
  ORDER_PAYMENT: "Pembayaran Order",
  COMMISSION_SHARE: "Bagian Perusahaan",
  RECURRING_EXPENSE: "Pengeluaran Rutin",
  MANUAL: "Manual",
};

export default async function AdminCashflowPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireRole("ADMIN");
  const { type = "all" } = await searchParams;

  async function handleAddManualCashFlow(formData: FormData) {
    "use server";
    const category = formData.get("category");
    const data = {
      type: (formData.get("type") as "INCOME" | "EXPENSE") || "EXPENSE",
      categoryId: category ? String(category) : undefined,
      amount: Number(formData.get("amount")),
      description: String(formData.get("description")),
      occurredAt: String(formData.get("date")),
    };
    await addManualCashFlow(data);
  }

  const [cashFlowsList, expenseCategoriesList] = await Promise.all([
    cashFlows(),
    expenseCategories(),
  ]);
  const filtered =
    type === "income"
      ? cashFlowsList.filter((c) => c.type === "INCOME")
      : type === "expense"
      ? cashFlowsList.filter((c) => c.type === "EXPENSE")
      : cashFlowsList;

  const totalIncome = cashFlowsList
    .filter((c) => c.type === "INCOME")
    .reduce((s, c) => s + c.amount, 0);
  const totalExpense = cashFlowsList
    .filter((c) => c.type === "EXPENSE")
    .reduce((s, c) => s + c.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <>
      <PageHeader
        title="Cashflow Ledger"
        description="Semua arus kas masuk dan keluar GridKita Creative."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-1.5" /> Catat Manual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Catat pengeluaran / pemasukan manual</DialogTitle>
              </DialogHeader>
              <form action={handleAddManualCashFlow} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipe</Label>
                  <Select name="type" defaultValue="EXPENSE">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Pemasukan</SelectItem>
                      <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select name="category">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategoriesList.map((c) => (
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
                    <Input type="number" name="amount" placeholder="cth. 85000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tanggal</Label>
                    <Input type="date" name="date" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Keterangan</Label>
                  <Textarea
                    name="description"
                    rows={2}
                    placeholder="cth. Beli kertas A3 untuk mockup"
                  />
                </div>
                <SubmitButton loadingText="Menyimpan..." className="w-full">
                  Simpan
                </SubmitButton>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Pemasukan"
          value={formatIDR(totalIncome)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatIDR(totalExpense)}
          icon={TrendingDown}
          tone="warning"
        />
        <StatCard
          label="Net Balance"
          value={formatIDR(netBalance)}
          icon={Minus}
          tone={netBalance >= 0 ? "primary" : "default"}
          hint={netBalance >= 0 ? "surplus" : "defisit"}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: "Semua" },
          { key: "income", label: "Pemasukan" },
          { key: "expense", label: "Pengeluaran" },
        ].map((t) => (
          <a
            key={t.key}
            href={t.key === "all" ? "/admin/cashflow" : `/admin/cashflow?type=${t.key}`}
          >
            <Badge
              variant={type === t.key || (t.key === "all" && type !== "income" && type !== "expense") ? "default" : "outline"}
              className="cursor-pointer text-sm py-1.5 px-3"
            >
              {t.label}
            </Badge>
          </a>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Keterangan</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Sumber</th>
                  <th className="px-4 py-3 font-medium">Tipe</th>
                  <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(c.occurredAt)}</td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <div className="truncate">{c.description}</div>
                      {c.sourceOrderId && (
                        <div className="text-xs text-muted-foreground">{c.sourceOrderId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {SOURCE_LABEL[c.source]}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          c.type === "INCOME"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        }
                      >
                        {c.type === "INCOME" ? "Masuk" : "Keluar"}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        c.type === "INCOME" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {c.type === "INCOME" ? "+" : "−"}
                      {formatIDR(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-medium">
                    Balance (tampil: {filtered.length} entri)
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">
                    {formatIDR(
                      filtered.reduce(
                        (s, c) => (c.type === "INCOME" ? s + c.amount : s - c.amount),
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
