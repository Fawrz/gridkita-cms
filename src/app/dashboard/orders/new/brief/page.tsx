import Link from "next/link";
import { ArrowLeft, Upload, Clock, Send } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageFallback } from "@/components/image-fallback";
import { packageBySlug } from "@/lib/queries/catalog";
import { formatIDR } from "@/lib/format";

export default async function BriefPage({
  searchParams,
}: {
  searchParams: Promise<{ pkg?: string; type?: string }>;
}) {
  const { pkg, type } = await searchParams;
  const isCustom = type === "custom";
  const pkgItem = pkg ? await packageBySlug(pkg) : null;
  if (!isCustom && !pkgItem) redirect("/dashboard/orders/new");

  async function submitBrief() {
    "use server";
    // Mock: lompat ke halaman order baru (pakai order existing untuk demo)
    redirect("/dashboard/orders/o_004");
  }

  return (
    <>
      <Link
        href="/dashboard/orders/new"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Kembali
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold mb-1">Form Brief</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Lengkapi informasi project agar desainer paham kebutuhan Anda.
            </p>

            <form action={submitBrief} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="projectName">
                  Nama Project <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectName"
                  name="projectName"
                  required
                  placeholder="cth. Logo Kafe Senja"
                />
              </div>

              {isCustom && (
                <div className="space-y-1.5">
                  <Label htmlFor="customDescription">
                    Deskripsi Kebutuhan Kustom <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="customDescription"
                    name="customDescription"
                    required
                    rows={4}
                    placeholder="Jelaskan apa saja deliverable yang Anda butuhkan: jumlah, ukuran, format, timeline, dst."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Admin akan mengirim quote setelah menerima permintaan ini.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="goals">
                  Tujuan Project <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="goals"
                  name="goals"
                  required
                  rows={3}
                  placeholder="Apa yang ingin dicapai dengan desain ini?"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="audience">Target Audiens</Label>
                  <Input
                    id="audience"
                    name="audience"
                    placeholder="cth. Anak muda 18-25 tahun"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Deadline yang diharapkan</Label>
                  <Input id="deadline" name="deadline" type="date" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="style">Catatan Gaya / Style</Label>
                <Textarea
                  id="style"
                  name="style"
                  rows={3}
                  placeholder="cth. Minimalist, modern, font sans-serif, palette earth tone"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="colors">Preferensi Warna</Label>
                <Input
                  id="colors"
                  name="colors"
                  placeholder="cth. #1a1a1a, #f5f5dc, gold"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Lampiran Referensi</Label>
                <label
                  htmlFor="files"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors text-center"
                >
                  <Upload className="size-6 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Klik untuk unggah atau drop file di sini
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG, PDF — maks. 100MB
                  </span>
                  <input
                    id="files"
                    name="files"
                    type="file"
                    multiple
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" size="lg">
                  <Send className="size-4 mr-1.5" />
                  {isCustom ? "Kirim Permintaan" : "Lanjut ke Pembayaran"}
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/dashboard/orders">Batal</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-20">
          {pkgItem && (
            <Card>
              <CardContent className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Paket Dipilih
                </div>
                <div className="relative h-28 mt-3 rounded-lg overflow-hidden bg-muted">
                  <ImageFallback
                    src={pkgItem.thumbnailUrl}
                    alt={pkgItem.name}
                    fallbackLabel={pkgItem.name}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 font-semibold">{pkgItem.name}</div>
                <div className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="size-3" /> {pkgItem.estimatedDays} hari kerja
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatIDR(pkgItem.basePrice)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {isCustom && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="p-5">
                <Badge variant="outline" className="bg-warning/15 border-warning/40 mb-2">
                  Permintaan Kustom
                </Badge>
                <p className="text-sm leading-relaxed">
                  Setelah brief dikirim, admin akan mengirim quote harga & estimasi
                  waktu untuk Anda setujui sebelum lanjut ke pembayaran.
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground space-y-2">
              <p>
                Brief yang lengkap = hasil yang lebih cepat sesuai ekspektasi. Tidak
                yakin? Anda tetap bisa revisi setelah desainer mulai.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
