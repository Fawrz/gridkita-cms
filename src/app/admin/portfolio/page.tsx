import Image from "next/image";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { portfolios } from "@/lib/queries/portfolio";
import { formatDate } from "@/lib/format";
import { deletePortfolio } from "@/app/actions/cms";

export default async function AdminPortfolioPage() {
  async function handleDeletePortfolio(formData: FormData) {
    "use server";
    const portfolioId = String(formData.get("portfolioId"));
    await deletePortfolio(portfolioId);
  }

  const portfolioList = await portfolios();
  return (
    <>
      <PageHeader title="CMS Portofolio" description="Tambah, edit, dan hapus galeri karya publik." actions={<PortfolioDialog action={noopAction} />} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {portfolioList.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative h-44 bg-muted"><Image src={p.coverUrl} alt={p.title} fill sizes="33vw" className="object-cover" /></div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3"><div><Badge variant="secondary" className="text-[10px]">{p.category}</Badge><h2 className="mt-2 font-semibold leading-tight">{p.title}</h2></div><div className="text-xs text-muted-foreground shrink-0">{formatDate(p.createdAt)}</div></div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-4 flex gap-2"><PortfolioDialog action={noopAction} editTitle={p.title} /><form action={handleDeletePortfolio}><input type="hidden" name="portfolioId" value={p.id} /><Button type="submit" size="sm" variant="outline"><Trash2 className="size-4 mr-1" /> Hapus</Button></form></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function PortfolioDialog({ action, editTitle }: { action: () => Promise<void>; editTitle?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button size="sm" variant={editTitle ? "outline" : "default"}>{editTitle ? <Pencil className="size-4 mr-1" /> : <Plus className="size-4 mr-1" />}{editTitle ? "Edit" : "Tambah Portfolio"}</Button></DialogTrigger>
      <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editTitle ? "Edit portfolio" : "Tambah portfolio"}</DialogTitle></DialogHeader><form action={action} className="space-y-4"><div className="space-y-1.5"><Label>Judul</Label><Input defaultValue={editTitle ?? ""} placeholder="cth. Rebranding Kopi Senja" /></div><div className="space-y-1.5"><Label>Kategori</Label><Input placeholder="Branding / Sosial Media" defaultValue="Branding" /></div><div className="space-y-1.5"><Label>Deskripsi</Label><Textarea rows={3} placeholder="Deskripsi singkat project..." /></div><label className="border-2 border-dashed rounded-lg p-6 grid place-items-center text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/40"><ImagePlus className="size-5 mb-1" />Upload cover / gambar<input type="file" className="hidden" /></label><Button type="submit" className="w-full">Simpan</Button></form></DialogContent>
    </Dialog>
  );
}
