import { redirect } from "next/navigation";
import { FolderPlus, Pencil, Plus, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { ImageFallback } from "@/components/image-fallback";
import { FormField } from "@/components/form-field";
import { ActionIconButton } from "@/components/action-icon-button";
import { categories, packages } from "@/lib/queries/catalog";
import { formatIDR } from "@/lib/format";
import { togglePackageActive } from "@/app/actions/cms";

export default async function AdminCatalogPage() {
  async function handleTogglePackage(formData: FormData) {
    "use server";
    const packageId = String(formData.get("packageId"));
    await togglePackageActive(packageId);
  }

  const [categoriesList, packagesList] = await Promise.all([categories(), packages()]);

  return (
    <>
      <PageHeader
        title="CMS Katalog"
        description="Kelola kategori dan paket jasa yang tampil di halaman publik."
        actions={<div className="flex gap-2"><CategoryDialog action={noopAction} /><PackageDialog action={noopAction} /></div>}
      />
      <div className="grid gap-9">
        {categoriesList.map((c) => {
          const list = packagesList.filter((p) => p.categoryId === c.id);
          return (
            <section key={c.id}>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
                <Badge variant="outline" className="min-h-7 px-3">{list.length} paket</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <Card key={p.id} className={!p.isActive ? "opacity-65" : ""}>
                    <div className="relative h-40 overflow-hidden rounded-t-2xl bg-muted">
                      <ImageFallback
                        src={p.thumbnailUrl}
                        alt={p.name}
                        fallbackLabel={p.name}
                        fill
                        sizes="33vw"
                        className="object-cover"
                      />
                      {p.isPopular && <Badge variant="popular" className="absolute left-3 top-3">Populer</Badge>}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold">{p.name}</div>
                          <div className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.description}</div>
                        </div>
                        <Switch checked={p.isActive} aria-label={`${p.isActive ? "Nonaktifkan" : "Aktifkan"} ${p.name}`} />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <div className="font-semibold tabular-nums">{formatIDR(p.basePrice)}</div>
                          <div className="text-xs text-muted-foreground">{p.estimatedDays} hari pengerjaan</div>
                        </div>
                        <div className="flex gap-1.5">
                          <PackageDialog action={noopAction} editTitle={p.name} />
                          <form action={handleTogglePackage}>
                            <input type="hidden" name="packageId" value={p.id} />
                            <ActionIconButton type="submit" label={`${p.isActive ? "Nonaktifkan" : "Aktifkan"} ${p.name}`}>
                              <Power className="size-4" aria-hidden="true" />
                            </ActionIconButton>
                          </form>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function CategoryDialog({ action }: { action: () => Promise<void> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><FolderPlus className="size-4" /> Kategori</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah kategori</DialogTitle></DialogHeader>
        <form action={action} className="space-y-4">
          <FormField id="category-name" label="Nama"><Input name="name" placeholder="Branding & Identitas" /></FormField>
          <FormField id="category-slug" label="Slug"><Input name="slug" placeholder="branding" /></FormField>
          <FormField id="category-description" label="Deskripsi"><Textarea name="description" rows={3} /></FormField>
          <Button type="submit" className="w-full">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PackageDialog({
  action,
  editTitle,
}: {
  action: () => Promise<void>;
  editTitle?: string;
}) {
  const suffix = editTitle ? "edit" : "new";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={editTitle ? "icon-sm" : "default"}
          variant={editTitle ? "outline" : "default"}
          aria-label={editTitle ? `Edit ${editTitle}` : undefined}
        >
          {editTitle ? <Pencil className="size-4" /> : <><Plus className="size-4" /> Paket</>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{editTitle ? "Edit paket" : "Tambah paket"}</DialogTitle></DialogHeader>
        <form action={action} className="space-y-4">
          <FormField id={`package-name-${suffix}`} label="Nama paket"><Input name="name" defaultValue={editTitle ?? ""} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id={`package-price-${suffix}`} label="Harga"><Input name="price" type="number" placeholder="450000" /></FormField>
            <FormField id={`package-days-${suffix}`} label="Estimasi hari"><Input name="estimatedDays" type="number" placeholder="5" /></FormField>
          </div>
          <FormField id={`package-description-${suffix}`} label="Deskripsi"><Textarea name="description" rows={3} /></FormField>
          <FormField id={`package-features-${suffix}`} label="Features"><Textarea name="features" rows={3} placeholder="Satu fitur per baris" /></FormField>
          <Button type="submit" className="w-full">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
