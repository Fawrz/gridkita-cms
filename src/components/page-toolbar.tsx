import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageToolbar({
  searchName = "q",
  searchValue,
  searchPlaceholder = "Cari data...",
  filters,
  activeFilter,
  baseHref,
  className,
}: {
  searchName?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  filters: { key: string; label: string }[];
  activeFilter: string;
  baseHref: string;
  className?: string;
}) {
  return (
    <Card className={cn("mb-4 overflow-visible", className)}>
      <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <form className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            name={searchName}
            defaultValue={searchValue}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35"
          />
          {activeFilter !== "all" && <input type="hidden" name="filter" value={activeFilter} />}
        </form>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none md:flex-wrap md:overflow-visible md:pb-0">
          <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          {filters.map((filter) => (
            <Link
              key={filter.key}
              href={filter.key === "all" ? baseHref : `${baseHref}?filter=${filter.key}`}
              scroll={false}
            >
              <Badge
                variant={activeFilter === filter.key ? "default" : "outline"}
                className="min-h-8 px-3"
              >
                {filter.label}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
