import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { requireRole } from "@/lib/session";
import { notificationsByUser } from "@/lib/queries/notifications";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ClientNotificationsPage() {
  const me = await requireRole("CLIENT");
  return <NotificationsList userId={me.id} />;
}

export async function NotificationsList({ userId }: { userId: string }) {
  const list = await notificationsByUser(userId);

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description="Pemberitahuan terkait pesanan dan akun Anda."
      />

      {list.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BellOff className="size-8 mx-auto mb-2 opacity-60" />
            <p>Belum ada notifikasi.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {list.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "p-4 flex items-start gap-3 hover:bg-muted/40 transition-colors",
                    !n.isRead && "bg-primary/[0.03]"
                  )}
                >
                  <div
                    className={cn(
                      "size-9 rounded-full grid place-items-center shrink-0",
                      !n.isRead ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Bell className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{n.title}</span>
                      {!n.isRead && (
                        <Badge variant="default" className="text-[9px] px-1.5">
                          Baru
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-xs text-primary hover:underline shrink-0 self-center"
                    >
                      Lihat →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
