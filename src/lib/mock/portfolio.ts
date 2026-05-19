import type { Portfolio } from "@/types";

export const portfolios: Portfolio[] = [
  {
    id: "pf_1",
    title: "Rebranding Kopi Senja",
    description:
      "Identitas visual lengkap untuk coffee shop boutique di Surabaya, dari logo, kemasan hingga signage.",
    category: "Branding",
    coverUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop",
      },
      {
        url: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "pf_2",
    title: "Konten Feed Beauty Brand",
    description:
      "Set 27 konten feed Instagram untuk brand skincare lokal selama 3 bulan kampanye.",
    category: "Sosial Media",
    coverUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "pf_3",
    title: "Poster Festival Musik Kampus",
    description:
      "Visual poster, IG feed dan e-flyer untuk Festival Musik Mahasiswa Universitas Negeri Surabaya.",
    category: "Print & Marketing",
    coverUrl:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "pf_4",
    title: "Logo & Menu Resto Padang",
    description:
      "Logo modern dan desain menu cetak untuk Restoran Padang Selera Bunda.",
    category: "Branding",
    coverUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "pf_5",
    title: "Banner Ads Online Course",
    description:
      "Kampanye iklan banner & landing visual untuk platform kursus online berbahasa Indonesia.",
    category: "Digital Marketing",
    coverUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "pf_6",
    title: "Brosur & Katalog Produk Fashion",
    description:
      "Katalog koleksi musim panas brand fashion lokal dengan layout editorial yang elegan.",
    category: "Print & Marketing",
    coverUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "pf_7",
    title: "Identity & Stationery Klinik Gigi",
    description:
      "Identitas visual + stationery (kartu nama, kop surat, amplop) untuk klinik gigi di Sidoarjo.",
    category: "Branding",
    coverUrl:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "pf_8",
    title: "Story Template Café",
    description: "Story template editable bulanan untuk café dengan tema seasonal.",
    category: "Sosial Media",
    coverUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&auto=format&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop",
      },
    ],
    createdById: "u_admin",
    createdAt: "2026-03-12T10:00:00Z",
  },
];

export function portfolioById(id: string): Portfolio | undefined {
  return portfolios.find((p) => p.id === id);
}
