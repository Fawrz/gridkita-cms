"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Image> & {
  fallbackLabel: string;
};

export function ImageFallback({
  fallbackLabel,
  alt,
  className,
  fill,
  ...props
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,oklch(0.53_0.22_278_/_0.20),transparent_32%),radial-gradient(circle_at_80%_20%,oklch(0.78_0.17_72_/_0.24),transparent_34%),linear-gradient(135deg,oklch(0.96_0.018_285),oklch(0.91_0.028_285))]",
          fill && "absolute inset-0",
          className
        )}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <div className="rounded-2xl bg-background/75 px-4 py-3 text-center shadow-sm ring-1 ring-border/70 backdrop-blur">
          <ImageIcon className="mx-auto mb-1 size-5 text-primary" aria-hidden="true" />
          <div className="max-w-36 text-xs font-semibold text-foreground line-clamp-2">
            {fallbackLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
