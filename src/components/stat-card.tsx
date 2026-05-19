import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  trend?: { value: number; positive?: boolean };
  tone?: "default" | "primary" | "success" | "warning" | "info";
  className?: string;
}) {
  const toneClass = {
    default: "bg-muted text-foreground/80",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning",
    info: "bg-info/10 text-info",
  }[tone];

  const topBorderClass = {
    default: "",
    primary: "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-primary/60 before:rounded-t-[inherit]",
    success: "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-success/60 before:rounded-t-[inherit]",
    warning: "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-warning/70 before:rounded-t-[inherit]",
    info: "before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-info/60 before:rounded-t-[inherit]",
  }[tone];

  return (
    <Card className={cn("relative overflow-hidden", topBorderClass, className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tighter tabular-nums">
              {value}
            </div>
            {(hint || trend) && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                {trend && (
                  <span
                    className={cn(
                      "font-medium",
                      trend.positive ? "text-success" : "text-destructive"
                    )}
                    aria-label={`${trend.positive ? "Naik" : "Turun"} ${Math.abs(trend.value)} persen`}
                  >
                    <span aria-hidden="true">{trend.positive ? "▲" : "▼"}</span>{" "}
                    {Math.abs(trend.value)}%
                  </span>
                )}
                {hint}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "size-12 rounded-xl grid place-items-center shrink-0",
                toneClass
              )}
            >
              <Icon className="size-6" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
