import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { ImageFallback } from "@/components/image-fallback";
import { categories, packages } from "@/lib/mock/catalog";
import { formatIDR } from "@/lib/format";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ pkg?: string; type?: string }>;
}) {
  const { type } = await searchParams;
  const isCustom = type === "custom";

  return (
    <>
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Kembali
      </Link>

      <PageHeader
        title={isCustom ? "Permintaan Kustom" : "Buat Pesanan Baru"}
        description={
          isCustom
            ? "Jelaskan kebutuhan kustom Anda. Admin akan mengirim penawaran harga dalam 1×24 jam."
            : "Pilih paket dari katalog atau ajukan permintaan kustom."
        }
      />

      {!isCustom && (
        <>
          <Card className="mb-6 border-dashed">
            <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">Tidak menemukan paket yang cocok?</div>
                  <p className="text-sm text-muted-foreground">
                    Ajukan permintaan kustom — admin akan kirim penawaran harga.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/dashboard/orders/new?type=custom">
                  Ajukan Kustom <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {categories.map((c) => {
            const list = packages.filter(
              (p) => p.categoryId === c.id && p.isActive
            );
            if (!list.length) return null;
            return (
              <section key={c.id} className="mb-8">
                <h2 className="text-base font-semibold mb-3">{c.name}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((p) => (
                    <Card key={p.id} className="overflow-hidden hover:shadow-md transition">
                      <div className="relative h-32 bg-muted">
                        <ImageFallback
                          src={p.thumbnailUrl}
                          alt={p.name}
                          fallbackLabel={p.name}
                          fill
                          sizes="33vw"
                          className="object-cover"
                        />
                        {p.isPopular && (
                          <Badge variant="popular" className="absolute top-2 left-2 text-[10px]">
                            Populer
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="font-medium leading-tight">{p.name}</div>
                        <div className="mt-1.5 text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="size-3" /> {p.estimatedDays} hari
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                          <div className="font-semibold tabular-nums">
                            {formatIDR(p.basePrice)}
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/dashboard/orders/new/brief?pkg=${p.slug}`}>
                              Pilih
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
        </>
      )}

      {isCustom && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Lanjutkan ke form brief untuk menjelaskan kebutuhan Anda. Setelah dikirim,
              admin akan mengirim penawaran (quote) yang dapat Anda setujui atau tolak.
            </p>
            <Button asChild>
              <Link href="/dashboard/orders/new/brief?type=custom">
                Lanjut ke Form Brief <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
