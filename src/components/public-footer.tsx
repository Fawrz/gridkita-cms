import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t mt-24 bg-muted/30">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandMark size="lg" />
          <p className="mt-3 text-sm text-muted-foreground max-w-sm leading-relaxed">
            Agensi kreatif jasa desain grafis & pemasaran digital. Mendigitalisasi
            seluruh alur dari brief hingga deliverable dalam satu platform.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium mb-3">Layanan</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/katalog" className="hover:text-foreground">
                Katalog Paket
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-foreground">
                Portofolio
              </Link>
            </li>
            <li>
              <Link href="/dashboard/orders/new?type=custom" className="hover:text-foreground">
                Permintaan Kustom
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium mb-3">Kontak</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden="true" /> halo@gridkita.id
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden="true" /> 0812-0000-0001
            </li>
            <li className="flex items-center gap-2">
              <AtSign className="size-4" aria-hidden="true" /> @gridkita.id
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" /> Surabaya, Indonesia
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} GridKita Creative. All rights reserved.</span>
          <span>
            Dibuat untuk SIM UAS · Kelompok 4 · D4 Manajemen Informatika UNESA
          </span>
        </div>
      </div>
    </footer>
  );
}
