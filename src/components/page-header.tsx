import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground text-wrap">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
