"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-svh grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl font-black text-destructive/30 mb-4">!</div>
        <h2 className="text-xl font-semibold tracking-tight">Terjadi kesalahan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "Sesuatu tidak berjalan dengan benar."}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={reset}>Coba lagi</Button>
          <Button asChild variant="outline">
            <Link href="/">Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
