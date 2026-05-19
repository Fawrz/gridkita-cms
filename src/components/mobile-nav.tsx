"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const NAV = [
  { href: "/portfolio", label: "Portofolio" },
  { href: "/katalog", label: "Katalog" },
  { href: "/about", label: "Tentang" },
];

interface MobileNavProps {
  dashboardPath?: string;
}

export function MobileNav({ dashboardPath }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Buka menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="pt-6 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-md hover:bg-muted text-sm"
            >
              {n.label}
            </Link>
          ))}
          <div className="border-t my-3" />
          {dashboardPath ? (
            <Button asChild>
              <Link href={dashboardPath}>Dashboard</Link>
            </Button>
          ) : (
            <div className="grid gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
