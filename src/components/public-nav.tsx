import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth-mock";
import { MobileNavLoader } from "@/components/mobile-nav-loader";

const NAV = [
  { href: "/portfolio", label: "Portofolio" },
  { href: "/katalog", label: "Katalog" },
  { href: "/about", label: "Tentang" },
];

export async function PublicNav() {
  const me = await getCurrentUser();
  return (
    <header className="sticky top-4 z-40 mx-4 md:mx-auto md:max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        {/* Main Pill: Brand & Navigation */}
        <div className="flex flex-1 h-14 items-center px-6 md:px-8 gap-8 rounded-full border border-border/40 bg-background/80 backdrop-blur-md shadow-sm">
          <BrandMark />
          <nav className="hidden md:flex flex-none items-center gap-6 lg:gap-8 text-sm font-medium">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile menu trigger inside the pill on small screens */}
          <div className="md:hidden ml-auto">
             <MobileNavLoader dashboardPath={me ? dashboardPathFor(me.role) : undefined} />
          </div>
        </div>

        {/* Floating CTA Buttons outside the pill */}
        <div className="hidden md:flex shrink-0 items-center gap-3">
          {me ? (
            <Button asChild size="sm" className="rounded-full px-6 h-10 shadow-sm border border-border/40">
              <Link href={dashboardPathFor(me.role)}>Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-full border border-border/40 p-1.5 shadow-sm">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-5 h-9 hover:bg-muted font-medium text-muted-foreground hover:text-foreground">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full px-6 h-9">
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
