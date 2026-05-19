import type { ServiceCategory, ServicePackage } from "@/types";

export const categories: ServiceCategory[] = [
  {
    id: "cat_branding",
    name: "Branding & Identitas",
    slug: "branding",
    description: "Logo, brand guideline, hingga identitas visual lengkap.",
    icon: "Palette",
  },
  {
    id: "cat_social",
    name: "Sosial Media",
    slug: "sosial-media",
    description: "Konten feed, carousel, dan template story Instagram/TikTok.",
    icon: "Instagram",
  },
  {
    id: "cat_print",
    name: "Print & Marketing",
    slug: "print-marketing",
    description: "Poster, brosur, kartu nama, dan materi cetak lainnya.",
    icon: "Printer",
  },
  {
    id: "cat_digital",
    name: "Digital Marketing",
    slug: "digital-marketing",
    description: "Banner ads, landing visual, hingga email blast.",
    icon: "Megaphone",
  },
];

export const packages: ServicePackage[] = [
  {
    id: "pkg_logo_basic",
    categoryId: "cat_branding",
    name: "Logo Basic",
    slug: "logo-basic",
    description:
      "Desain logo sederhana untuk usaha kecil. Cocok untuk warung, UMKM, dan toko online baru.",
    features: [
      "1 konsep logo",
      "2x revisi minor",
      "File PNG + JPG",
      "Estimasi 3 hari kerja",
    ],
    basePrice: 150_000,
    estimatedDays: 3,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_logo_pro",
    categoryId: "cat_branding",
    name: "Logo Pro + Guideline",
    slug: "logo-pro",
    description:
      "Logo profesional plus brand guideline 8 halaman. Dilengkapi mockup aplikasi logo.",
    features: [
      "3 konsep logo",
      "5x revisi",
      "File master AI/SVG/PDF",
      "Brand guideline 8 hal",
      "Mockup aplikasi",
    ],
    basePrice: 750_000,
    estimatedDays: 7,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
    isActive: true,
    isPopular: true,
  },
  {
    id: "pkg_ig_feed",
    categoryId: "cat_social",
    name: "Feed Instagram 9 Slot",
    slug: "feed-instagram-9",
    description: "Desain 9 konten feed Instagram dengan tema serasi.",
    features: ["9 desain feed", "Konsep tema selaras", "2x revisi per slot", "PNG 1080x1080"],
    basePrice: 450_000,
    estimatedDays: 5,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop",
    isActive: true,
    isPopular: true,
  },
  {
    id: "pkg_ig_story",
    categoryId: "cat_social",
    name: "Story Template 6 Slide",
    slug: "story-template",
    description: "Template story Instagram editable untuk promo & engagement.",
    features: ["6 template story", "File Canva editable", "1x revisi"],
    basePrice: 200_000,
    estimatedDays: 3,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_poster",
    categoryId: "cat_print",
    name: "Poster Promo A3",
    slug: "poster-promo-a3",
    description: "Desain poster promo siap cetak ukuran A3.",
    features: ["File PDF print-ready", "300 DPI CMYK", "2x revisi"],
    basePrice: 175_000,
    estimatedDays: 2,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_brosur",
    categoryId: "cat_print",
    name: "Brosur Tri-fold",
    slug: "brosur-trifold",
    description: "Brosur tiga lipat A4 untuk produk/jasa Anda.",
    features: ["Desain 2 sisi", "Print-ready", "3x revisi"],
    basePrice: 300_000,
    estimatedDays: 4,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_namecard",
    categoryId: "cat_print",
    name: "Kartu Nama Premium",
    slug: "kartu-nama-premium",
    description: "Desain kartu nama dua sisi dengan finishing premium.",
    features: ["2 sisi desain", "File PDF print", "1x revisi"],
    basePrice: 100_000,
    estimatedDays: 2,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1600172454520-134a85b1c021?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_banner_ads",
    categoryId: "cat_digital",
    name: "Banner Ads Set",
    slug: "banner-ads-set",
    description: "Set 5 banner iklan ukuran umum (FB, IG, GDN).",
    features: ["5 ukuran banner", "PNG + animated GIF static", "2x revisi"],
    basePrice: 350_000,
    estimatedDays: 4,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "pkg_landing",
    categoryId: "cat_digital",
    name: "Landing Page Visual",
    slug: "landing-page-visual",
    description:
      "Konsep visual landing page (Figma) siap dikembangkan oleh developer.",
    features: ["Wireframe + mockup", "Mobile + desktop", "3x revisi"],
    basePrice: 600_000,
    estimatedDays: 6,
    thumbnailUrl:
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop",
    isActive: true,
  },
];

export function packageById(id: string): ServicePackage | undefined {
  return packages.find((p) => p.id === id);
}

export function packageBySlug(slug: string): ServicePackage | undefined {
  return packages.find((p) => p.slug === slug);
}

export function categoryById(id: string): ServiceCategory | undefined {
  return categories.find((c) => c.id === id);
}

export function packagesByCategory(categoryId: string): ServicePackage[] {
  return packages.filter((p) => p.categoryId === categoryId && p.isActive);
}
