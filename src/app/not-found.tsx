import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="min-h-svh grid place-items-center px-4 gridkita-gradient">
      <div className="text-center max-w-sm">
        <BrandMark size="lg" href="/" />
        <div className="mt-8 text-7xl font-black tracking-tight text-primary/20 select-none">
          404
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-muted-foreground">
          URL yang Anda akses tidak tersedia. Mungkin sudah dipindah atau belum ada.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link href="/">Ke Beranda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/katalog">Lihat Katalog</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
