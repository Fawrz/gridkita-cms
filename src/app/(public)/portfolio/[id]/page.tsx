import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageFallback } from "@/components/image-fallback";
import { portfolioById, portfolios } from "@/lib/mock/portfolio";
import { formatDate } from "@/lib/format";

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = portfolioById(id);
  if (!item) notFound();

  const related = portfolios.filter((p) => p.category === item.category && p.id !== item.id).slice(0, 3);

  return (
    <article className="container mx-auto px-4 py-10 md:py-16">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Kembali ke portofolio
      </Link>

      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-3">{item.category}</Badge>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{item.description}</p>
        <div className="mt-3 text-sm text-muted-foreground">
          Dipublikasikan {formatDate(item.createdAt)}
        </div>
      </div>

      <div className="mt-10 space-y-6">
        {item.images.map((img, i) => (
          <div key={i} className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
            <ImageFallback
              src={img.url}
              alt={img.caption ?? item.title}
              fallbackLabel={img.caption ?? item.title}
              fill
              sizes="(min-width:1024px) 1200px, 100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border bg-card p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Tertarik membuat karya seperti ini?</h2>
        <p className="mt-2 text-muted-foreground">Pilih paket atau ajukan permintaan kustom.</p>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <Button asChild>
            <Link href="/katalog">Lihat Katalog</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/orders/new?type=custom">Permintaan Kustom</Link>
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xl font-semibold mb-5">Karya lain di kategori {item.category}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/portfolio/${r.id}`}
                className="rounded-xl overflow-hidden border bg-card hover:shadow-md transition"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <ImageFallback src={r.coverUrl} alt={r.title} fallbackLabel={r.title} fill sizes="33vw" className="object-cover" />
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm leading-tight line-clamp-2">{r.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
