import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Clock, BarChart3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageFallback } from "@/components/image-fallback";
import { portfolios } from "@/lib/mock/portfolio";
import { packages, categories } from "@/lib/mock/catalog";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featuredPortfolios = portfolios.slice(0, 6);
  const popular = packages.filter((p) => p.isPopular).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 gridkita-dots opacity-40" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" aria-hidden />
        <div className="container mx-auto px-4 pt-18 pb-20 md:pt-32 md:pb-32 relative">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary text-sm font-medium">
              <Sparkles className="size-4 mr-2" />
              Agensi Kreatif Terintegrasi
            </Badge>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-foreground mb-6 text-balance leading-none">
              Desain grafis & marketing, <br className="hidden md:block" />
              <span className="text-muted-foreground italic">pesan tanpa drama.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
              GridKita mengelola brief, pembayaran, pengerjaan, hingga revisi dalam
              satu platform terpusat. Klien jelas, desainer fokus, owner tenang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base shadow-sm">
                <Link href="/katalog">
                  Lihat Katalog Paket <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border">
                <Link href="/portfolio">Jelajahi Portofolio</Link>
              </Button>
            </div>

            {/* Mini stat strip */}
            <div className="mt-14 md:mt-20 pt-8 md:pt-10 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 md:gap-y-10 w-full max-w-3xl">
              {[
                ["120+", "Project selesai"],
                ["8", "Kategori layanan"],
                ["3 Hari", "Rata-rata pengerjaan"],
                ["4.9/5", "Rating klien"],
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col items-center">
                  <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                    {v}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bento portfolio showcase */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground mb-4 text-balance">
              Karya yang berbicara.
            </h2>
            <p className="text-lg text-muted-foreground">
              Pilihan project yang dikerjakan tim GridKita — dari rebranding UMKM
              hingga kampanye digital nasional.
            </p>
          </div>
          <Button asChild variant="ghost" className="rounded-full hover:bg-muted">
            <Link href="/portfolio">Lihat semua karya <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[300px] md:auto-rows-[320px]">
          {featuredPortfolios.map((p, i) => (
            <Link
              key={p.id}
              href={`/portfolio/${p.id}`}
              className={cn(
                "group relative overflow-hidden rounded-3xl bg-muted border border-border/50",
                i === 0 && "md:row-span-2 md:col-span-1 md:h-full",
                i === 1 && "md:col-span-2"
              )}
            >
              <ImageFallback
                src={p.coverUrl}
                alt=""
                fallbackLabel={p.title}
                fill
                sizes="(min-width:768px) 33vw, 100vw"
                priority={i === 0}
                className="object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
              />
              {/* Gradient overlay — always present, strengthens on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent motion-safe:group-hover:from-black/85 motion-safe:transition-colors motion-safe:duration-500" />
              {/* Text always visible; hover lifts it slightly */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white motion-safe:translate-y-1 motion-safe:group-hover:translate-y-0 motion-safe:transition-transform motion-safe:duration-300">
              <Badge variant="outline" className="bg-white/20 border-white/40 text-white backdrop-blur-md mb-3 px-3 py-0.5">
                  {p.category}
                </Badge>
                <div className="text-xl md:text-2xl font-semibold leading-tight line-clamp-2 drop-shadow-sm">{p.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="bg-muted/30 py-20 md:py-32 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16 text-center mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 text-balance">
              Bukan sekadar agensi,<br />tapi sistem terpadu.
            </h2>
            <p className="text-lg text-muted-foreground">
              Kami menyederhanakan proses kompleks menjadi langkah-langkah yang jelas dan terukur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Layers,
                title: "Self-service Order",
                desc: "Pilih paket, isi brief terstruktur, lampirkan referensi — tanpa bolak-balik chat.",
              },
              {
                icon: ShieldCheck,
                title: "Pembayaran Aman",
                desc: "QRIS resmi GridKita + verifikasi admin sebelum pekerjaan dimulai.",
              },
              {
                icon: Clock,
                title: "Status Real-time",
                desc: "Pantau setiap tahap: dikerjakan, revisi, selesai, terkirim. Audit trail lengkap.",
              },
              {
                icon: BarChart3,
                title: "Transparan & Adil",
                desc: "Komisi otomatis tercatat untuk desainer; cashflow rapi untuk pemilik bisnis.",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className="size-16 rounded-2xl bg-background border shadow-sm grid place-items-center mb-6">
                  <f.icon className="size-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Kategori Layanan
          </h2>
          <p className="text-lg text-muted-foreground">
            Temukan solusi desain yang tepat untuk kebutuhan spesifik bisnis Anda.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/katalog?cat=${c.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-8 hover:border-primary/30 hover:shadow-md hover:bg-muted/20 motion-safe:transition-[border-color,box-shadow,background-color] motion-safe:duration-300"
            >
              <div>
                <h3 className="font-semibold text-xl mb-3 group-hover:text-primary motion-safe:transition-colors">{c.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{c.description}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 text-sm font-medium text-foreground inline-flex items-center gap-2 group-hover:text-primary motion-safe:transition-colors">
                Lihat paket <ArrowRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular packages */}
      <section className="container mx-auto px-4 pb-20 md:pb-32">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              Paling Sering Dipesan
            </h2>
            <p className="text-lg text-muted-foreground">Paket desain terpopuler yang dipercaya oleh banyak klien kami.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/katalog">Eksplor semua paket <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {popular.map((p) => (
            <Card key={p.id} className="overflow-hidden rounded-3xl border-border/60 hover:shadow-xl hover:shadow-primary/5 motion-safe:transition-shadow motion-safe:duration-300 flex flex-col">
              <div className="relative h-56 bg-muted p-2">
                <ImageFallback src={p.thumbnailUrl} alt={p.name} fallbackLabel={p.name} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover rounded-2xl" />
                <Badge variant="popular" className="absolute top-4 left-4 shadow-sm">
                  Populer
                </Badge>
              </div>
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="text-sm font-medium text-primary mb-3">
                  {categories.find((c) => c.id === p.categoryId)?.name}
                </div>
                <h3 className="font-semibold text-2xl mb-3 leading-tight">{p.name}</h3>
                <p className="text-muted-foreground line-clamp-2 leading-relaxed mb-8 flex-1">
                  {p.description}
                </p>
                <div className="pt-6 border-t border-border/50 flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Harga mulai</div>
                    <div className="text-2xl font-bold tabular-nums tracking-tight">
                      {formatIDR(p.basePrice)}
                    </div>
                  </div>
                  <Button asChild className="rounded-full px-6">
                    <Link href={`/katalog/${p.slug}`}>Pesan</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24 md:pb-32">
        <div className="rounded-[2.5rem] bg-primary p-10 md:p-20 text-center max-w-5xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 gridkita-mesh opacity-40" aria-hidden />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 text-balance text-primary-foreground">
              Siap untuk upgrade visual brand Anda?
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Daftar gratis sekarang, dan mulai wujudkan ide Anda bersama tim kreatif GridKita.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full h-14 px-10 text-base bg-white text-primary hover:bg-white/90 shadow-lg">
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-10 text-base border-white/55 bg-white/10 text-white shadow-lg backdrop-blur hover:bg-white hover:text-primary">
                <Link href="/dashboard/orders/new?type=custom">Konsultasi Kustom</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
