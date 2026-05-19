import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ImageFallback } from "@/components/image-fallback";
import { portfolios } from "@/lib/mock/portfolio";
import { PageHeader } from "@/components/page-header";

const CATEGORIES = ["Semua", ...Array.from(new Set(portfolios.map((p) => p.category)))];

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const active = cat ?? "Semua";
  const list =
    active === "Semua" ? portfolios : portfolios.filter((p) => p.category === active);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <PageHeader
        title="Portofolio Karya"
        description="Kumpulan project terpilih yang dikerjakan tim GridKita."
      />

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={c === "Semua" ? "/portfolio" : `/portfolio?cat=${encodeURIComponent(c)}`}
            scroll={false}
          >
            <Badge
              variant={active === c ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm"
            >
              {c}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/portfolio/${p.id}`}
            className="group overflow-hidden rounded-3xl border bg-card transition-[border-color,box-shadow,transform] hover:border-primary/25 hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              <ImageFallback
                src={p.coverUrl}
                alt={p.title}
                fallbackLabel={p.title}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
              <div className="mt-2 font-semibold leading-tight group-hover:text-primary">
                {p.title}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {p.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
