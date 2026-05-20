import { redirect } from "next/navigation";
import { ImagePlus, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/session";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");

  async function saveSettings() {
    "use server";
    redirect("/admin/settings?saved=1");
  }

  return (
    <>
      <PageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi QRIS, informasi agensi, dan preferensi operasional."
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {/* QRIS */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-1">QRIS Pembayaran</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Gambar QR statis yang tampil kepada klien saat checkout. Ganti kapan saja.
              </p>
              <form action={saveSettings} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="size-40 shrink-0 rounded-xl border-2 border-dashed bg-muted grid place-items-center text-center text-xs text-muted-foreground p-3 relative overflow-hidden">
                    <div>
                      <ImagePlus className="size-6 mx-auto mb-1 text-muted-foreground/60" />
                      Preview QRIS
                      <br />
                      GridKita Creative
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="space-y-1.5">
                      <Label>Upload gambar QRIS baru</Label>
                      <label
                        htmlFor="qris"
                        className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors text-center"
                      >
                        <ImagePlus className="size-5 text-muted-foreground" />
                        <span className="text-sm font-medium">Klik untuk unggah QRIS</span>
                        <span className="text-xs text-muted-foreground">PNG / JPG, maks 2MB</span>
                        <input id="qris" type="file" accept="image/*" className="hidden" />
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nama merchant (tampil di QRIS)</Label>
                      <Input defaultValue="GridKita Creative" name="merchantName" />
                    </div>
                    <SubmitButton loadingText="Menyimpan..." className="w-full">
                      <Save className="size-4 mr-1.5" /> Simpan QRIS
                    </SubmitButton>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Agency info */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-1">Informasi Agensi</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Tampil di footer publik dan invoice.
              </p>
              <form action={saveSettings} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Nama agensi</Label>
                    <Input defaultValue="GridKita Creative" name="agencyName" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email kontak</Label>
                    <Input type="email" defaultValue="halo@gridkita.id" name="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nomor WhatsApp</Label>
                    <Input defaultValue="0812-0000-0001" name="phone" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Instagram</Label>
                    <Input defaultValue="@gridkita.id" name="instagram" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Alamat</Label>
                    <Input defaultValue="Surabaya, Jawa Timur, Indonesia" name="address" />
                  </div>
                </div>
                <SubmitButton loadingText="Menyimpan...">
                  <Save className="size-4 mr-1.5" /> Simpan
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          {/* Operational */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-1">Konfigurasi Operasional</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Aturan bisnis utama sistem.
              </p>
              <form action={saveSettings} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Komisi desainer (%)</Label>
                    <Input
                      type="number"
                      defaultValue="70"
                      name="commissionRate"
                      min={1}
                      max={99}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sesuai PRD §4.5 — COMMISSION_RATE = 0.70 (konstan, define di satu tempat).
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max upload file (MB)</Label>
                    <Input type="number" defaultValue="100" name="maxUpload" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Polling notifikasi (detik)</Label>
                    <Input type="number" defaultValue="30" name="pollInterval" />
                    <p className="text-xs text-muted-foreground">
                      PRD §4.7 — polling tiap 30 detik, tidak pakai WebSocket.
                    </p>
                  </div>
                </div>
                <SubmitButton loadingText="Menyimpan...">
                  <Save className="size-4 mr-1.5" /> Simpan
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardContent className="p-5 text-sm space-y-3">
              <h3 className="font-semibold">Catatan Implementasi</h3>
              <Separator />
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-medium text-foreground">QRIS:</span> File disimpan di{" "}
                  <code className="bg-muted px-1 rounded text-xs">public/uploads/catalog/</code>{" "}
                  (publik). Path disimpan di DB.
                </p>
                <p>
                  <span className="font-medium text-foreground">Payroll:</span> Konstanta{" "}
                  <code className="bg-muted px-1 rounded text-xs">COMMISSION_RATE</code> di-define
                  di <code className="bg-muted px-1 rounded text-xs">src/lib/payroll.ts</code>{" "}
                  — satu tempat, tidak tersebar.
                </p>
                <p>
                  <span className="font-medium text-foreground">Recurring:</span> Generator
                  idempoten — cek{" "}
                  <code className="bg-muted px-1 rounded text-xs">lastGeneratedAt</code> sebelum
                  insert.
                </p>
                <p>
                  <span className="font-medium text-foreground">Notifikasi:</span> Polling 30 detik
                  (bukan WebSocket) sesuai PRD §4.7.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
