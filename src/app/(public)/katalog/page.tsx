import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageFallback } from "@/components/image-fallback";
import { categories, packages } from "@/lib/queries/catalog";
import { PageHeader } from "@/components/page-header";
import { formatIDR } from "@/lib/format";
import { ArrowRight, Clock, Sparkles } from "lucide-react";

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const allCategories = await categories();
  const allPackages = await packages();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageHeader
        title="Katalog Paket Layanan"
        description="Pilih paket yang sesuai. Harga transparan, estimasi pengerjaan jelas."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/orders/new?type=custom">
              <Sparkles className="size-4 mr-1.5" /> Permintaan Kustom
            </Link>
          </Button>
        }
      />

      <div className="flex gap-2 mb-10 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-none">
        <Link href="/katalog" scroll={false}>
          <Badge variant={!cat ? "default" : "outline"} className="cursor-pointer px-3 py-1.5 text-sm">
            Semua
          </Badge>
        </Link>
        {allCategories.map((c) => (
          <Link key={c.id} href={`/katalog?cat=${c.slug}`} scroll={false}>
            <Badge
              variant={cat === c.slug ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
            >
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      {allCategories
        .filter((c) => !cat || c.slug === cat)
        .map((c) => {
          const list = allPackages.filter((p) => p.categoryId === c.id && p.isActive);
          if (list.length === 0) return null;
          return (
            <section key={c.id} className="mb-12 last:mb-0">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold">{c.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {list.map((p) => (
                  <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative h-44 bg-muted">
                      <ImageFallback
                        src={p.thumbnailUrl}
                        alt={p.name}
                        fallbackLabel={p.name}
                        fill
                        sizes="(min-width:1024px) 33vw, 100vw"
                        className="object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-500"
                      />
                      {p.isPopular && (
                        <Badge variant="popular" className="absolute top-3 left-3">Populer</Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="font-semibold leading-tight">{p.name}</div>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {p.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden="true" /> {p.estimatedDays} hari
                        </span>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Mulai dari
                          </div>
                          <div className="text-xl font-semibold tabular-nums">
                            {formatIDR(p.basePrice)}
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/katalog/${p.slug}`}>
                            Detail <ArrowRight className="ml-1 size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
