import Link from "next/link";
import { cn } from "@/lib/utils";

export function GridKitaLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid grid-cols-2 grid-rows-2 gap-[2px] size-7 rounded-md overflow-hidden",
        className
      )}
      aria-hidden
    >
      <span className="bg-primary" />
      <span className="bg-accent" />
      <span className="bg-chart-3" />
      <span className="bg-foreground/80" />
    </span>
  );
}

export function BrandMark({
  href = "/",
  size = "default",
}: {
  href?: string;
  size?: "default" | "lg";
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-semibold tracking-tight"
    >
      <GridKitaLogo className={size === "lg" ? "size-9" : "size-7"} />
      <span className={size === "lg" ? "text-xl" : "text-base"}>
        GridKita<span className="text-primary">.</span>
      </span>
    </Link>
  );
}
