import type { OrderStatusHistory, User } from "@/types";
import { STATUS_LABEL } from "@/lib/state-machine";
import { formatDateTime } from "@/lib/format";
import { Check } from "lucide-react";

export function OrderTimeline({ history, usersMap }: { history: OrderStatusHistory[]; usersMap?: Map<string, User> }) {
  if (!history.length) {
    return (
      <p className="text-sm text-muted-foreground italic">Belum ada riwayat status.</p>
    );
  }

  return (
    <ol className="relative border-l ml-3 pl-6 space-y-5">
      {history.map((h, i) => {
        const actor = usersMap?.get(h.changedById);
        const isLast = i === history.length - 1;
        return (
          <li key={h.id} className="relative">
            <span
              className={`absolute -left-[31px] size-6 rounded-full grid place-items-center ${
                isLast ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border"
              }`}
              aria-hidden
            >
              <Check className="size-3" />
            </span>
            <div className="text-sm font-medium">{STATUS_LABEL[h.toStatus]}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {formatDateTime(h.changedAt)}
              {actor && <> · oleh {actor.name}</>}
            </div>
            {h.note && (
              <p className="mt-1.5 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2 italic">
                &quot;{h.note}&quot;
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
