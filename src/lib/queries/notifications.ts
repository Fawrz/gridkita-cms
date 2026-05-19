import { db } from "@/lib/db";
import type { AppNotification } from "@/types";

export async function notificationsByUser(userId: string): Promise<AppNotification[]> {
  const list = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return list.map((n) => ({
    id: n.id, userId: n.userId, type: n.type as AppNotification["type"],
    title: n.title, message: n.message, link: n.link ?? undefined,
    isRead: n.isRead, createdAt: n.createdAt.toISOString(),
  }));
}

export async function unreadCount(userId: string): Promise<number> {
  return db.notification.count({ where: { userId, isRead: false } });
}
