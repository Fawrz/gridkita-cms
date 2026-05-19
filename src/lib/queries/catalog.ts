import { db } from "@/lib/db";
import type { ServiceCategory, ServicePackage } from "@/types";

function toCat(c: { id: string; name: string; slug: string; description: string; icon: string | null }): ServiceCategory {
  return { ...c, icon: c.icon ?? undefined, description: c.description };
}

function toPkg(p: {
  id: string; categoryId: string; name: string; slug: string; description: string;
  features: unknown; basePrice: { toNumber(): number }; estimatedDays: number;
  thumbnailPath: string; isActive: boolean; isPopular: boolean;
}): ServicePackage {
  return {
    id: p.id, categoryId: p.categoryId, name: p.name, slug: p.slug,
    description: p.description,
    features: Array.isArray(p.features) ? (p.features as string[]) :
      JSON.parse(p.features as string) as string[],
    basePrice: p.basePrice.toNumber(),
    estimatedDays: p.estimatedDays,
    thumbnailUrl: p.thumbnailPath,
    isActive: p.isActive, isPopular: p.isPopular,
  };
}

export async function categories(): Promise<ServiceCategory[]> {
  return (await db.serviceCategory.findMany({ orderBy: { name: "asc" } })).map(toCat);
}

export async function packages(): Promise<ServicePackage[]> {
  return (await db.servicePackage.findMany()).map(toPkg);
}

export async function packageBySlug(slug: string): Promise<ServicePackage | undefined> {
  const p = await db.servicePackage.findUnique({ where: { slug } });
  return p ? toPkg(p) : undefined;
}

export async function packageById(id: string): Promise<ServicePackage | undefined> {
  const p = await db.servicePackage.findUnique({ where: { id } });
  return p ? toPkg(p) : undefined;
}

export async function packagesByCategory(categoryId: string): Promise<ServicePackage[]> {
  return (await db.servicePackage.findMany({ where: { categoryId, isActive: true } })).map(toPkg);
}

export async function categoryById(id: string): Promise<ServiceCategory | undefined> {
  const c = await db.serviceCategory.findUnique({ where: { id } });
  return c ? toCat(c) : undefined;
}
