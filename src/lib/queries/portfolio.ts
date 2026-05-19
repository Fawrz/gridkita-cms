import { db } from "@/lib/db";
import type { Portfolio } from "@/types";

export async function portfolios(): Promise<Portfolio[]> {
  const list = await db.portfolio.findMany({
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return list.map((p) => ({
    id: p.id, title: p.title, description: p.description,
    category: p.category, createdById: p.createdById,
    coverUrl: p.images[0]?.path ?? "",
    images: p.images.map((img) => ({ url: img.path, caption: img.caption ?? undefined })),
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function portfolioById(id: string): Promise<Portfolio | undefined> {
  const p = await db.portfolio.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!p) return undefined;
  return {
    id: p.id, title: p.title, description: p.description,
    category: p.category, createdById: p.createdById,
    coverUrl: p.images[0]?.path ?? "",
    images: p.images.map((img) => ({ url: img.path, caption: img.caption ?? undefined })),
    createdAt: p.createdAt.toISOString(),
  };
}
