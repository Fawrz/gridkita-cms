import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex xl:w-[500px]">
        <div className="absolute inset-0 gridkita-mesh opacity-70" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight text-primary-foreground">
            <span className="inline-grid size-7 grid-cols-2 grid-rows-2 gap-[2px] overflow-hidden rounded-md opacity-90" aria-hidden>
              <span className="bg-white/80" />
              <span className="bg-white/50" />
              <span className="bg-white/60" />
              <span className="bg-white/30" />
            </span>
            GridKita<span className="opacity-70">.</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="grid size-14 place-items-center rounded-3xl bg-white/15 ring-1 ring-white/20">
            <Sparkles className="size-6 text-primary-foreground" aria-hidden />
          </div>
          <blockquote className="text-xl font-medium leading-relaxed text-primary-foreground/90">
            &ldquo;GridKita menyederhanakan seluruh alur kerja kreatif - dari brief hingga payout - dalam satu platform.&rdquo;
          </blockquote>
          <p className="text-sm text-primary-foreground/60">Platform manajemen agensi kreatif terintegrasi.</p>
        </div>
        <div className="relative z-10 text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} GridKita Creative
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 px-4 py-4 backdrop-blur-md lg:hidden">
          <div className="container mx-auto flex items-center justify-between">
            <BrandMark />
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Kembali ke beranda
            </Link>
          </div>
        </header>
        <main className="grid flex-1 place-items-center overflow-x-hidden bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.17_72_/_0.14),transparent_30%),radial-gradient(circle_at_bottom_left,oklch(0.53_0.22_278_/_0.10),transparent_32%),var(--background)] px-4 py-10">
          <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md">
            <Link href="/" className="mb-8 hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground lg:inline-flex">
              Kembali ke beranda
            </Link>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
