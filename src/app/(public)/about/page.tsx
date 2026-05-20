import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageHeader
        title="Tentang GridKita"
        description="Agensi kreatif berbasis Surabaya yang membantu UMKM dan brand lokal tumbuh lewat desain dan pemasaran digital."
      />

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 md:p-8 prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <h2 className="text-xl font-semibold">Misi kami</h2>
            <p className="text-muted-foreground leading-relaxed">
              Memberikan akses jasa kreatif profesional bagi UMKM Indonesia dengan
              alur yang transparan, terstruktur, dan tanpa drama bolak-balik chat.
              Setiap project di GridKita dikawal oleh sistem terintegrasi —
              dari brief, pembayaran, pengerjaan, hingga laporan keuangan internal.
            </p>
            <h2 className="text-xl font-semibold mt-6">Bagaimana kami bekerja</h2>
            <ol className="text-muted-foreground leading-relaxed space-y-1.5">
              <li>Klien memilih paket atau mengajukan permintaan kustom.</li>
              <li>Brief dan referensi dikumpulkan secara terstruktur.</li>
              <li>Pembayaran QRIS diverifikasi sebelum pengerjaan dimulai.</li>
              <li>Desainer mengerjakan dan meng-update status real-time.</li>
              <li>Klien melakukan revisi atau approve hasil akhir.</li>
              <li>Komisi dibagi otomatis 70/30 (desainer/kas perusahaan).</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Badge variant="secondary">Tim Inti</Badge>
            <ul className="space-y-3 text-sm">
              <li><span className="font-medium">Damar Prakoso</span> — Owner & Admin</li>
              <li><span className="font-medium">Arka Mahendra</span> — Lead Designer</li>
              <li><span className="font-medium">Nara Satria</span> — Designer</li>
              <li><span className="font-medium">Bagas Wiratama</span> — Designer</li>
              <li><span className="font-medium">Tara Kusuma</span> — Operations</li>
            </ul>
            <div className="border-t pt-4 text-xs text-muted-foreground">
              Proyek SIM UAS · Kelompok 4 · D4 Manajemen Informatika UNESA 2026
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
