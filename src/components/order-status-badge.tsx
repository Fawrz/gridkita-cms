import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/state-machine";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary/10 text-primary border-primary/25",
  info: "bg-info/10 text-info border-info/30 dark:text-info",
  warn: "bg-warning/15 text-warning-foreground border-warning/40 dark:text-warning",
  coral: "bg-orange-500/12 text-orange-700 border-orange-500/30 dark:text-orange-300",
  ok: "bg-success/15 text-success border-success/30",
  bad: "bg-destructive/10 text-destructive border-destructive/30",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const tone = STATUS_TONE[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium uppercase tracking-wide text-[10px] px-2 py-0.5 whitespace-nowrap",
        TONE_CLASS[tone],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
