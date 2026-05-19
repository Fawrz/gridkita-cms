import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EntityCard({
  href,
  title,
  eyebrow,
  meta,
  status,
  value,
  className,
}: {
  href?: string;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  meta?: React.ReactNode;
  status?: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
}) {
  const body = (
    <Card className={cn("transition-[border-color,box-shadow,transform] hover:border-primary/25 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <div className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</div>}
            <div className="font-semibold leading-snug text-foreground">{title}</div>
            {meta && <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{meta}</div>}
          </div>
          {status && <div className="shrink-0">{status}</div>}
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="font-semibold tabular-nums">{value}</div>
          {href && <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
