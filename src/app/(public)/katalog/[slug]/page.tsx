import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageFallback } from "@/components/image-fallback";
import { categoryById, packageBySlug, packages } from "@/lib/queries/catalog";
import { formatIDR } from "@/lib/format";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await packageBySlug(slug);
  if (!pkg) notFound();
  const category = await categoryById(pkg.categoryId);
  const allPackages = await packages();
  const related = allPackages
    .filter((p) => p.categoryId === pkg.categoryId && p.id !== pkg.id && p.isActive)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Kembali ke katalog
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
          <ImageFallback
            src={pkg.thumbnailUrl}
            alt={pkg.name}
            fallbackLabel={pkg.name}
            fill
            sizes="(min-width:1024px) 600px, 100vw"
            className="object-cover"
            priority
          />
          {pkg.isPopular && (
            <Badge variant="popular" className="absolute top-4 left-4">Populer</Badge>
          )}
        </div>

        <div>
          {category && <Badge variant="secondary">{category.name}</Badge>}
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{pkg.name}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{pkg.description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <div className="text-3xl md:text-4xl font-semibold tabular-nums">
              {formatIDR(pkg.basePrice)}
            </div>
            <span className="text-sm text-muted-foreground">harga mulai</span>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" /> Estimasi {pkg.estimatedDays} hari kerja
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-sm font-medium">Yang Anda dapatkan</div>
            <ul className="space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-success mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/dashboard/orders/new?pkg=${pkg.slug}`}>
                Pesan Sekarang <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/orders/new?type=custom">Diskusikan kustom</Link>
            </Button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Daftar dulu
            </Link>{" "}
            untuk melanjutkan pemesanan.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-semibold mb-5">Paket lain di kategori ini</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {related.map((r) => (
              <Card key={r.id} className="overflow-hidden hover:shadow-md transition">
                <div className="relative h-36 bg-muted">
                  <ImageFallback src={r.thumbnailUrl} alt={r.name} fallbackLabel={r.name} fill sizes="33vw" className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="font-medium leading-tight">{r.name}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm font-semibold tabular-nums">{formatIDR(r.basePrice)}</div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/katalog/${r.slug}`}>Detail</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
