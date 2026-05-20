import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function h(amount: number) {
  return Math.round(amount);
}

async function main() {
  console.log("🌱 Seeding database GridKita...");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("  → Users...");
  const adminPass    = await bcrypt.hash("gridkita2026", 12);
  const designerPass = await bcrypt.hash("designer123",  12);
  const clientPass   = await bcrypt.hash("client123",    12);

  const admin = await db.user.upsert({
    where: { email: "admin@gridkita.id" },
    update: { password: adminPass, name: "Damar Prakoso", role: "ADMIN", phone: "081200000001", avatarUrl: "https://i.pravatar.cc/120?img=47", isActive: true },
    create: { email: "admin@gridkita.id", password: adminPass, name: "Damar Prakoso", role: "ADMIN", phone: "081200000001", avatarUrl: "https://i.pravatar.cc/120?img=47", isActive: true },
  });

  const arka = await db.user.upsert({
    where: { email: "arka@gridkita.id" },
    update: { password: designerPass, name: "Arka Mahendra", role: "DESIGNER", phone: "081200000002", bankAccount: "BCA 1234567890 a.n. Arka Mahendra", avatarUrl: "https://i.pravatar.cc/120?img=12", isActive: true },
    create: { email: "arka@gridkita.id", password: designerPass, name: "Arka Mahendra", role: "DESIGNER", phone: "081200000002", bankAccount: "BCA 1234567890 a.n. Arka Mahendra", avatarUrl: "https://i.pravatar.cc/120?img=12", isActive: true },
  });

  const nara = await db.user.upsert({
    where: { email: "nara@gridkita.id" },
    update: { password: designerPass, name: "Nara Satria", role: "DESIGNER", phone: "081200000003", bankAccount: "Mandiri 9876543210 a.n. Nara Satria", avatarUrl: "https://i.pravatar.cc/120?img=33", isActive: true },
    create: { email: "nara@gridkita.id", password: designerPass, name: "Nara Satria", role: "DESIGNER", phone: "081200000003", bankAccount: "Mandiri 9876543210 a.n. Nara Satria", avatarUrl: "https://i.pravatar.cc/120?img=33", isActive: true },
  });

  await db.user.upsert({
    where: { email: "bagas@gridkita.id" },
    update: { password: designerPass, name: "Bagas Wiratama", role: "DESIGNER", phone: "081200000004", bankAccount: "BNI 5556667778 a.n. Bagas Wiratama", avatarUrl: "https://i.pravatar.cc/120?img=14", isActive: false },
    create: { email: "bagas@gridkita.id", password: designerPass, name: "Bagas Wiratama", role: "DESIGNER", phone: "081200000004", bankAccount: "BNI 5556667778 a.n. Bagas Wiratama", avatarUrl: "https://i.pravatar.cc/120?img=14", isActive: false },
  });

  const tara = await db.user.upsert({
    where: { email: "tara@example.com" },
    update: { password: clientPass, name: "Tara Kusuma", role: "CLIENT", phone: "081299999991", avatarUrl: "https://i.pravatar.cc/120?img=68", isActive: true },
    create: { email: "tara@example.com", password: clientPass, name: "Tara Kusuma", role: "CLIENT", phone: "081299999991", avatarUrl: "https://i.pravatar.cc/120?img=68", isActive: true },
  });

  const nesya = await db.user.upsert({
    where: { email: "nesya@example.com" },
    update: { password: clientPass, name: "Nesya Larasati", role: "CLIENT", phone: "081299999992", avatarUrl: "https://i.pravatar.cc/120?img=45", isActive: true },
    create: { email: "nesya@example.com", password: clientPass, name: "Nesya Larasati", role: "CLIENT", phone: "081299999992", avatarUrl: "https://i.pravatar.cc/120?img=45", isActive: true },
  });

  const gilang = await db.user.upsert({
    where: { email: "gilang@example.com" },
    update: { password: clientPass, name: "Gilang Aditya", role: "CLIENT", phone: "081299999993", avatarUrl: "https://i.pravatar.cc/120?img=52", isActive: true },
    create: { email: "gilang@example.com", password: clientPass, name: "Gilang Aditya", role: "CLIENT", phone: "081299999993", avatarUrl: "https://i.pravatar.cc/120?img=52", isActive: true },
  });

  // ── 2. Service Categories ─────────────────────────────────────────────────
  console.log("  → Katalog...");
  const catBranding = await db.serviceCategory.upsert({
    where: { slug: "branding" },
    update: {},
    create: { name: "Branding & Identitas", slug: "branding", description: "Logo, brand guideline, hingga identitas visual lengkap.", icon: "Palette" },
  });
  const catSocial = await db.serviceCategory.upsert({
    where: { slug: "sosial-media" },
    update: {},
    create: { name: "Sosial Media", slug: "sosial-media", description: "Konten feed, carousel, dan template story Instagram/TikTok.", icon: "AtSign" },
  });
  const catPrint = await db.serviceCategory.upsert({
    where: { slug: "print-marketing" },
    update: {},
    create: { name: "Print & Marketing", slug: "print-marketing", description: "Poster, brosur, kartu nama, dan materi cetak lainnya.", icon: "Printer" },
  });
  const catDigital = await db.serviceCategory.upsert({
    where: { slug: "digital-marketing" },
    update: {},
    create: { name: "Digital Marketing", slug: "digital-marketing", description: "Banner ads, landing visual, hingga email blast.", icon: "Megaphone" },
  });

  // ── 3. Service Packages ───────────────────────────────────────────────────
  const pkgsData = [
    { slug: "logo-basic",       categoryId: catBranding.id, name: "Logo Basic",                description: "Desain logo sederhana untuk usaha kecil. Cocok untuk UMKM dan toko online baru.",                                       features: ["1 konsep logo", "2x revisi minor", "File PNG + JPG", "Estimasi 3 hari kerja"],                          basePrice: 150_000, estimatedDays: 3, thumbnailPath: "https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "logo-pro",         categoryId: catBranding.id, name: "Logo Pro + Guideline",       description: "Logo profesional plus brand guideline 8 halaman. Dilengkapi mockup aplikasi logo.",                         features: ["3 konsep logo", "5x revisi", "File master AI/SVG/PDF", "Brand guideline 8 hal", "Mockup aplikasi"], basePrice: 750_000, estimatedDays: 7, thumbnailPath: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop", isActive: true, isPopular: true },
    { slug: "feed-instagram-9", categoryId: catSocial.id,   name: "Feed Instagram 9 Slot",      description: "Desain 9 konten feed Instagram dengan tema serasi.",                                                                            features: ["9 desain feed", "Konsep tema selaras", "2x revisi per slot", "PNG 1080x1080"],                            basePrice: 450_000, estimatedDays: 5, thumbnailPath: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop", isActive: true, isPopular: true },
    { slug: "story-template",   categoryId: catSocial.id,   name: "Story Template 6 Slide",     description: "Template story Instagram editable untuk promo & engagement.",                                                                    features: ["6 template story", "File Canva editable", "1x revisi"],                                                  basePrice: 200_000, estimatedDays: 3, thumbnailPath: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "poster-promo-a3",  categoryId: catPrint.id,    name: "Poster Promo A3",            description: "Desain poster promo siap cetak ukuran A3.",                                                                                       features: ["File PDF print-ready", "300 DPI CMYK", "2x revisi"],                                                       basePrice: 175_000, estimatedDays: 2, thumbnailPath: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "brosur-trifold",   categoryId: catPrint.id,    name: "Brosur Tri-fold",           description: "Brosur tiga lipat A4 untuk produk/jasa Anda.",                                                                                  features: ["Desain 2 sisi", "Print-ready", "3x revisi"],                                                                basePrice: 300_000, estimatedDays: 4, thumbnailPath: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "kartu-nama",       categoryId: catPrint.id,    name: "Kartu Nama Premium",         description: "Desain kartu nama dua sisi dengan finishing premium.",                                                                           features: ["2 sisi desain", "File PDF print", "1x revisi"],                                                              basePrice: 100_000, estimatedDays: 2, thumbnailPath: "https://images.unsplash.com/photo-1600172454520-134a85b1c021?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "banner-ads-set",   categoryId: catDigital.id,  name: "Banner Ads Set",            description: "Set 5 banner iklan ukuran umum (FB, IG, GDN).",                                                                                    features: ["5 ukuran banner", "PNG + GIF", "2x revisi"],                                                                basePrice: 350_000, estimatedDays: 4, thumbnailPath: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { slug: "landing-visual",   categoryId: catDigital.id,  name: "Landing Page Visual",        description: "Konsep visual landing page (Figma) siap dikembangkan oleh developer.",                                                            features: ["Wireframe + mockup", "Mobile + desktop", "3x revisi"],                                                       basePrice: 600_000, estimatedDays: 6, thumbnailPath: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
  ];

  for (const p of pkgsData) {
    await db.servicePackage.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, features: p.features } });
  }

  const pkgLogoPro      = await db.servicePackage.findUniqueOrThrow({ where: { slug: "logo-pro" } });
  const pkgPoster       = await db.servicePackage.findUniqueOrThrow({ where: { slug: "poster-promo-a3" } });
  const pkgFeed         = await db.servicePackage.findUniqueOrThrow({ where: { slug: "feed-instagram-9" } });
  const pkgBanner       = await db.servicePackage.findUniqueOrThrow({ where: { slug: "banner-ads-set" } });
  const pkgLanding      = await db.servicePackage.findUniqueOrThrow({ where: { slug: "landing-visual" } });
  const pkgKartuNama    = await db.servicePackage.findUniqueOrThrow({ where: { slug: "kartu-nama" } });
  const pkgBrosur       = await db.servicePackage.findUniqueOrThrow({ where: { slug: "brosur-trifold" } });
  const pkgStory        = await db.servicePackage.findUniqueOrThrow({ where: { slug: "story-template" } });
  const pkgLogoBasic    = await db.servicePackage.findUniqueOrThrow({ where: { slug: "logo-basic" } });

  // ── 4. Portfolio ──────────────────────────────────────────────────────────
  console.log("  → Portfolio...");
  const portfolioItems = [
    { title: "Rebranding Kopi Senja",           description: "Identitas visual lengkap untuk coffee shop boutique di Surabaya, dari logo, kemasan hingga signage.",           category: "Branding",        images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop", "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1600&auto=format&fit=crop"] },
    { title: "Konten Feed Beauty Brand",        description: "Set 27 konten feed Instagram untuk brand skincare lokal selama 3 bulan kampanye.",                            category: "Sosial Media",    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop"] },
    { title: "Poster Festival Musik Kampus",    description: "Visual poster, IG feed dan e-flyer untuk Festival Musik Mahasiswa UNESA.",                                     category: "Print & Marketing", images: ["https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1600&auto=format&fit=crop"] },
    { title: "Logo & Menu Resto Padang",        description: "Logo modern dan desain menu cetak untuk Restoran Padang Selera Bunda.",                                        category: "Branding",        images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop"] },
    { title: "Banner Ads Online Course",        description: "Kampanye iklan banner & landing visual untuk platform kursus online berbahasa Indonesia.",                     category: "Digital Marketing", images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop"] },
    { title: "Brosur & Katalog Produk Fashion", description: "Katalog koleksi musim panas brand fashion lokal dengan layout editorial yang elegan.",                        category: "Print & Marketing", images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop"] },
    { title: "Identity & Stationery Klinik Gigi", description: "Identitas visual + stationery untuk klinik gigi di Sidoarjo.",                                               category: "Branding",        images: ["https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1600&auto=format&fit=crop"] },
    { title: "Story Template Café",             description: "Story template editable bulanan untuk café dengan tema seasonal.",                                           category: "Sosial Media",    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop"] },
  ];
  for (const pf of portfolioItems) {
    const exists = await db.portfolio.findFirst({ where: { title: pf.title } });
    if (!exists) {
      await db.portfolio.create({
        data: { title: pf.title, description: pf.description, category: pf.category, createdById: admin.id, images: { create: pf.images.map((url, i) => ({ path: url, order: i })) } },
      });
    }
  }

  // ── 5. Expense Categories + Recurring Expenses ────────────────────────────
  console.log("  → Keuangan...");
  const ecOp = await db.expenseCategory.upsert({ where: { id: "ec-op" }, update: {}, create: { id: "ec-op", name: "Operasional", isOperational: true } });
  const ecSoftware = await db.expenseCategory.upsert({ where: { id: "ec-software" }, update: {}, create: { id: "ec-software", name: "Software & Lisensi", isOperational: true } });
  const ecMarketing = await db.expenseCategory.upsert({ where: { id: "ec-marketing" }, update: {}, create: { id: "ec-marketing", name: "Marketing", isOperational: false } });
  const ecAlat = await db.expenseCategory.upsert({ where: { id: "ec-alat" }, update: {}, create: { id: "ec-alat", name: "Alat & Perlengkapan", isOperational: false } });

  await db.recurringExpense.upsert({ where: { id: "re-wifi" },    update: {}, create: { id: "re-wifi",    categoryId: ecOp.id,       name: "WiFi Indihome",                amount: 180_000, recurrenceDay: 5,  isActive: true } });
  await db.recurringExpense.upsert({ where: { id: "re-adobe" },   update: {}, create: { id: "re-adobe",   categoryId: ecSoftware.id, name: "Adobe Creative Cloud (1 seat)", amount: 15_000,  recurrenceDay: 1,  isActive: true } });
  await db.recurringExpense.upsert({ where: { id: "re-canva" },   update: {}, create: { id: "re-canva",   categoryId: ecSoftware.id, name: "Canva Pro",                    amount: 60_000,  recurrenceDay: 10, isActive: true } });
  await db.recurringExpense.upsert({ where: { id: "re-gsheet" },  update: {}, create: { id: "re-gsheet",  categoryId: ecMarketing.id, name: "Google Ads",                   amount: 200_000, recurrenceDay: 1,  isActive: true } });

  // ── 6. Demo Orders ────────────────────────────────────────────────────────
  console.log("  → Demo orders...");

  const exists = await db.order.findFirst({ where: { code: "GK-2026-0001" } });
  if (exists) {
    console.log("  → Orders already exist, skipping order creation.");
  } else {
    const JAN = new Date("2026-01-15T08:00:00Z");
    const FEB = new Date("2026-02-15T08:00:00Z");
    const MAR = new Date("2026-03-01T09:00:00Z");
    const MAR3 = new Date("2026-03-03T10:00:00Z");
    const MAR5 = new Date("2026-03-05T09:00:00Z");
    const MAR7 = new Date("2026-03-07T09:00:00Z");
    const MAR10 = new Date("2026-03-10T09:00:00Z");
    const MAR12 = new Date("2026-03-12T10:00:00Z");
    const MAR15 = new Date("2026-03-15T11:00:00Z");
    const MAR18 = new Date("2026-03-18T09:00:00Z");
    const MAR20 = new Date("2026-03-20T10:00:00Z");
    const MAR22 = new Date("2026-03-22T09:00:00Z");
    const MAR25 = new Date("2026-03-25T11:00:00Z");
    const MAR28 = new Date("2026-03-28T10:00:00Z");
    const APR1  = new Date("2026-04-01T09:00:00Z");
    const APR3  = new Date("2026-04-03T10:00:00Z");
    const APR5  = new Date("2026-04-05T11:00:00Z");
    const APR10 = new Date("2026-04-10T09:00:00Z");
    const APR15 = new Date("2026-04-15T10:00:00Z");
    const MAY1  = new Date("2026-05-01T09:00:00Z");
    const MAY5  = new Date("2026-05-05T10:00:00Z");
    const MAY10 = new Date("2026-05-10T11:00:00Z");
    const MAY15 = new Date("2026-05-15T09:00:00Z");

    // ── Order O001: DELIVERED ──────────────────────────────────────────────────
    const o001 = await db.order.create({
      data: {
        code: "GK-2026-0001", clientId: tara.id, designerId: arka.id,
        type: "PACKAGE", servicePackageId: pkgLogoPro.id, finalPrice: 750_000,
        status: "DELIVERED", revisionCount: 1, adminApprovedDeliverable: true,
        briefData: { projectName: "Logo Brand Skincare 'Lumiere'", goals: "Logo elegan, feminine, modern untuk brand skincare lokal premium.", targetAudience: "Wanita 25-40 tahun, segmen menengah atas", styleNotes: "Minimalist, serif font, gold-rose color scheme", deadline: "2026-03-15" },
        createdAt: MAR, updatedAt: MAR18,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o001.id, fromStatus: null,              toStatus: "PENDING_PAYMENT",      changedById: tara.id,  changedAt: MAR,  note: null },
      { orderId: o001.id, fromStatus: "PENDING_PAYMENT", toStatus: "WAITING_VERIFICATION", changedById: tara.id,  changedAt: MAR3, note: "Bukti transfer diunggah" },
      { orderId: o001.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",            changedById: admin.id, changedAt: MAR5, note: "Pembayaran terverifikasi" },
      { orderId: o001.id, fromStatus: "PAID",            toStatus: "ASSIGNED",             changedById: admin.id, changedAt: MAR5, note: "Ditugaskan ke Arka" },
      { orderId: o001.id, fromStatus: "ASSIGNED",        toStatus: "IN_PROGRESS",          changedById: arka.id,  changedAt: MAR7, note: null },
      { orderId: o001.id, fromStatus: "IN_PROGRESS",     toStatus: "DONE",                 changedById: arka.id,  changedAt: MAR12, note: null },
      { orderId: o001.id, fromStatus: "DONE",            toStatus: "REVISION",             changedById: tara.id,  changedAt: MAR15, note: "Tolong color palette lebih hangat" },
      { orderId: o001.id, fromStatus: "REVISION",        toStatus: "IN_PROGRESS",          changedById: arka.id,  changedAt: MAR15, note: null },
      { orderId: o001.id, fromStatus: "IN_PROGRESS",     toStatus: "DONE",                 changedById: arka.id,  changedAt: MAR18, note: null },
      { orderId: o001.id, fromStatus: "DONE",            toStatus: "DELIVERED",            changedById: tara.id,  changedAt: MAR18, note: "Hasil sudah sesuai, terima kasih!" },
    ] });
    await db.payment.create({ data: { orderId: o001.id, amount: 750_000, qrisImageUrl: "/qris-sample.svg", proofPath: null, status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR5, uploadedAt: MAR3 } });
    await db.deliverable.create({ data: { orderId: o001.id, designerId: arka.id, path: "https://picsum.photos/seed/lumiere1/800/600", fileName: "lumiere-logo-final.png", mimeType: "image/png", sizeBytes: 2_456_000, uploadedAt: MAR18 } });
    await db.deliverable.create({ data: { orderId: o001.id, designerId: arka.id, path: "https://picsum.photos/seed/lumiere2/800/600", fileName: "lumiere-brand-guideline.pdf", mimeType: "application/pdf", sizeBytes: 8_123_000, uploadedAt: MAR18 } });
    await db.orderAttachment.create({ data: { orderId: o001.id, path: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", name: "moodboard-lumiere.jpg", uploadedById: tara.id, kind: "REFERENCE", uploadedAt: MAR } });

    // Payroll + cashflow untuk O001
    await db.payrollEntry.create({ data: { orderId: o001.id, designerId: arka.id, orderTotal: 750_000, commissionAmount: h(750_000 * 0.7), companyShare: h(750_000 * 0.3), status: "ACCRUED", accruedAt: MAR18 } });
    await db.cashFlow.create({ data: { type: "INCOME", source: "ORDER_PAYMENT", amount: 750_000, description: "Pembayaran order GK-2026-0001", sourceOrderId: o001.id, recordedById: admin.id, occurredAt: MAR5 } });
    await db.cashFlow.create({ data: { type: "INCOME", source: "COMMISSION_SHARE", amount: h(750_000 * 0.3), description: "Bagian perusahaan 30% - GK-2026-0001", sourceOrderId: o001.id, recordedById: admin.id, occurredAt: MAR18 } });

    // ── Order O002: PENDING_PAYMENT ────────────────────────────────────────────
    const o002 = await db.order.create({
      data: {
        code: "GK-2026-0002", clientId: tara.id,
        type: "PACKAGE", servicePackageId: pkgPoster.id, finalPrice: 175_000,
        status: "PENDING_PAYMENT", revisionCount: 0,
        briefData: { projectName: "Poster Promo Diskon Lebaran", goals: "Poster A3 cetak untuk promo hari raya toko fashion.", styleNotes: "Bold typography, merah-emas, vibe festive" },
        createdAt: MAR10, updatedAt: MAR10,
      },
    });
    await db.orderStatusHistory.create({ data: { orderId: o002.id, toStatus: "PENDING_PAYMENT", changedById: tara.id, changedAt: MAR10 } });
    await db.payment.create({ data: { orderId: o002.id, amount: 175_000, qrisImageUrl: "/qris-sample.svg", status: "PENDING", uploadedAt: null } });

    // ── Order O003: QUOTE_REQUESTED ────────────────────────────────────────────
    const o003 = await db.order.create({
      data: {
        code: "GK-2026-0003", clientId: nesya.id,
        type: "CUSTOM", finalPrice: 0,
        customDescription: "Saya butuh visual identity lengkap untuk acara wisuda kampus: poster, e-flyer, IG feed 5 slot, dan banner panggung.",
        status: "QUOTE_REQUESTED", revisionCount: 0,
        briefData: { projectName: "Visual Wisuda Universitas", goals: "Identitas visual menyeluruh untuk acara wisuda UNESA.", deadline: "2026-04-20" },
        createdAt: MAR10, updatedAt: MAR10,
      },
    });
    await db.orderStatusHistory.create({ data: { orderId: o003.id, toStatus: "QUOTE_REQUESTED", changedById: nesya.id, changedAt: MAR10 } });

    // ── Order O004: IN_PROGRESS ────────────────────────────────────────────────
    const o004 = await db.order.create({
      data: {
        code: "GK-2026-0004", clientId: gilang.id, designerId: nara.id,
        type: "PACKAGE", servicePackageId: pkgFeed.id, finalPrice: 450_000,
        status: "IN_PROGRESS", revisionCount: 0,
        briefData: { projectName: "Konten Feed IG Café Senja", goals: "9 feed engagement bulan promosi grand opening cabang baru.", targetAudience: "Mahasiswa & pekerja kantoran 20-30 tahun", styleNotes: "Warm, golden hour vibe, foto produk + tipografi handwritten", deadline: "2026-04-01" },
        createdAt: MAR12, updatedAt: MAR22,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o004.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: gilang.id, changedAt: MAR12, note: null },
      { orderId: o004.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: gilang.id, changedAt: MAR15, note: "Bukti transfer diunggah" },
      { orderId: o004.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id,  changedAt: MAR18, note: "Pembayaran terverifikasi" },
      { orderId: o004.id, fromStatus: "PAID",               toStatus: "ASSIGNED",             changedById: admin.id,  changedAt: MAR18, note: "Ditugaskan ke Nara" },
      { orderId: o004.id, fromStatus: "ASSIGNED",           toStatus: "IN_PROGRESS",          changedById: nara.id,   changedAt: MAR22, note: null },
    ] });
    await db.payment.create({ data: { orderId: o004.id, amount: 450_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR18, uploadedAt: MAR15 } });
    await db.orderAttachment.create({ data: { orderId: o004.id, path: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600", name: "cafe-references.jpg", uploadedById: gilang.id, kind: "REFERENCE", uploadedAt: MAR12 } });

    // ── Order O005: QUOTE_OFFERED ──────────────────────────────────────────────
    const o005 = await db.order.create({
      data: {
        code: "GK-2026-0005", clientId: tara.id,
        type: "PACKAGE", servicePackageId: pkgBanner.id, finalPrice: 350_000, quotedPrice: 350_000,
        status: "QUOTE_OFFERED", revisionCount: 0,
        briefData: { projectName: "Banner Ads Launch Produk", goals: "5 banner iklan untuk kampanye peluncuran produk baru fashion brand.", styleNotes: "Bold, modern, warna brand", deadline: "2026-04-10" },
        createdAt: MAR15, updatedAt: MAR20,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o005.id, fromStatus: null,              toStatus: "QUOTE_REQUESTED", changedById: tara.id,  changedAt: MAR15, note: "Saya butuh banner untuk campaign" },
      { orderId: o005.id, fromStatus: "QUOTE_REQUESTED", toStatus: "QUOTE_OFFERED",  changedById: admin.id, changedAt: MAR20, note: "Penawaran harga: Rp350.000 untuk 5 banner" },
    ] });

    // ── Order O006: WAITING_VERIFICATION ───────────────────────────────────────
    const o006 = await db.order.create({
      data: {
        code: "GK-2026-0006", clientId: tara.id,
        type: "PACKAGE", servicePackageId: pkgLanding.id, finalPrice: 600_000,
        status: "WAITING_VERIFICATION", revisionCount: 0,
        briefData: { projectName: "Landing Page Skincare Brand", goals: "Konsep visual landing page untuk brand skincare premium.", targetAudience: "Wanita 25-40", styleNotes: "Soft pastel, elegant", deadline: "2026-04-15" },
        createdAt: MAR18, updatedAt: MAR25,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o006.id, fromStatus: null,              toStatus: "PENDING_PAYMENT",      changedById: tara.id,  changedAt: MAR18 },
      { orderId: o006.id, fromStatus: "PENDING_PAYMENT", toStatus: "WAITING_VERIFICATION", changedById: tara.id,  changedAt: MAR25, note: "Pembayaran via QRIS" },
    ] });
    await db.payment.create({ data: { orderId: o006.id, amount: 600_000, qrisImageUrl: "/qris-sample.svg", proofPath: "/proofs/payment-skincare.jpg", status: "WAITING", uploadedAt: MAR25 } });

    // ── Order O007: PAID ───────────────────────────────────────────────────────
    const o007 = await db.order.create({
      data: {
        code: "GK-2026-0007", clientId: nesya.id,
        type: "PACKAGE", servicePackageId: pkgLogoBasic.id, finalPrice: 150_000,
        status: "PAID", revisionCount: 0,
        briefData: { projectName: "Logo Toko Online 'Berkah Jaya'", goals: "Logo sederhana untuk toko online baru.", styleNotes: "Modern, warna hijau, icon shopping bag", deadline: "2026-03-28" },
        createdAt: MAR20, updatedAt: MAR25,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o007.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: nesya.id,  changedAt: MAR20 },
      { orderId: o007.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: nesya.id,  changedAt: MAR22, note: "Upload proof" },
      { orderId: o007.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id,  changedAt: MAR25, note: "Pembayaran diverifikasi" },
    ] });
    await db.payment.create({ data: { orderId: o007.id, amount: 150_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR25, uploadedAt: MAR22 } });

    // ── Order O008: REVISION ──────────────────────────────────────────────────
    const o008 = await db.order.create({
      data: {
        code: "GK-2026-0008", clientId: gilang.id, designerId: arka.id,
        type: "PACKAGE", servicePackageId: pkgBrosur.id, finalPrice: 300_000,
        status: "REVISION", revisionCount: 1,
        briefData: { projectName: "Brosur Travel Umrah 2026", goals: "Brosur lipat 3 untuk travel umrah.", targetAudience: "Jamaah umrah 40+", styleNotes: "Elegant, warna emas-putih, kaligrafi", deadline: "2026-04-01" },
        createdAt: MAR22, updatedAt: APR3,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o008.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: gilang.id, changedAt: MAR22 },
      { orderId: o008.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: gilang.id, changedAt: MAR25, note: "Proof terupload" },
      { orderId: o008.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id,  changedAt: MAR28, note: "Pembayaran OK" },
      { orderId: o008.id, fromStatus: "PAID",               toStatus: "ASSIGNED",             changedById: admin.id,  changedAt: MAR28, note: "Ditugaskan ke Arka" },
      { orderId: o008.id, fromStatus: "ASSIGNED",           toStatus: "IN_PROGRESS",          changedById: arka.id,   changedAt: APR1 },
      { orderId: o008.id, fromStatus: "IN_PROGRESS",        toStatus: "DONE",                 changedById: arka.id,   changedAt: APR3 },
      { orderId: o008.id, fromStatus: "DONE",               toStatus: "REVISION",             changedById: gilang.id, changedAt: APR3, note: "Tolong layoutnya diperbaiki, font terlalu kecil" },
    ] });
    await db.payment.create({ data: { orderId: o008.id, amount: 300_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR28, uploadedAt: MAR25 } });
    await db.deliverable.create({ data: { orderId: o008.id, designerId: arka.id, path: "https://picsum.photos/seed/brosur1/800/600", fileName: "brosur-umrah-v1.pdf", mimeType: "application/pdf", sizeBytes: 4_200_000, uploadedAt: APR3 } });
    await db.orderAttachment.create({ data: { orderId: o008.id, path: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600", name: "contoh-brosur.jpg", uploadedById: gilang.id, kind: "REFERENCE", uploadedAt: MAR22 } });

    // ── Order O009: DONE ──────────────────────────────────────────────────────
    const o009 = await db.order.create({
      data: {
        code: "GK-2026-0009", clientId: nesya.id, designerId: nara.id,
        type: "PACKAGE", servicePackageId: pkgStory.id, finalPrice: 200_000,
        status: "DONE", revisionCount: 0, adminApprovedDeliverable: false,
        briefData: { projectName: "Story Template UMKM Snack", goals: "6 template story untuk promosi snack kekinian.", styleNotes: "Ceria, warna neon, playful", deadline: "2026-04-05" },
        createdAt: MAR22, updatedAt: APR5,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o009.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: nesya.id,  changedAt: MAR22 },
      { orderId: o009.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: nesya.id,  changedAt: MAR25, note: "Proof" },
      { orderId: o009.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id,  changedAt: MAR28, note: "Verifikasi ok" },
      { orderId: o009.id, fromStatus: "PAID",               toStatus: "ASSIGNED",             changedById: admin.id,  changedAt: MAR28, note: "Ke Nara" },
      { orderId: o009.id, fromStatus: "ASSIGNED",           toStatus: "IN_PROGRESS",          changedById: nara.id,   changedAt: APR1 },
      { orderId: o009.id, fromStatus: "IN_PROGRESS",        toStatus: "DONE",                 changedById: nara.id,   changedAt: APR5, note: "6 template siap" },
    ] });
    await db.payment.create({ data: { orderId: o009.id, amount: 200_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR28, uploadedAt: MAR25 } });
    await db.deliverable.create({ data: { orderId: o009.id, designerId: nara.id, path: "https://picsum.photos/seed/story1/800/600", fileName: "story-template-v3.png", mimeType: "image/png", sizeBytes: 1_800_000, uploadedAt: APR5 } });
    await db.deliverable.create({ data: { orderId: o009.id, designerId: nara.id, path: "https://picsum.photos/seed/story2/800/600", fileName: "story-template-v4.png", mimeType: "image/png", sizeBytes: 1_950_000, uploadedAt: APR5 } });

    // ── Order O010: ASSIGNED ─────────────────────────────────────────────────
    const o010 = await db.order.create({
      data: {
        code: "GK-2026-0010", clientId: tara.id, designerId: nara.id,
        type: "PACKAGE", servicePackageId: pkgKartuNama.id, finalPrice: 100_000,
        status: "ASSIGNED", revisionCount: 0,
        briefData: { projectName: "Kartu Nama Konsultan Bisnis", goals: "Kartu nama premium untuk konsultan bisnis.", styleNotes: "Minimalist, gold foil effect, font serif", deadline: "2026-04-10" },
        createdAt: MAR25, updatedAt: MAR28,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o010.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: tara.id,  changedAt: MAR25 },
      { orderId: o010.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: tara.id,  changedAt: MAR28, note: "Proof" },
      { orderId: o010.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id, changedAt: MAR28, note: "Verified" },
      { orderId: o010.id, fromStatus: "PAID",               toStatus: "ASSIGNED",             changedById: admin.id, changedAt: MAR28, note: "Ditugaskan ke Nara" },
    ] });
    await db.payment.create({ data: { orderId: o010.id, amount: 100_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: MAR28, uploadedAt: MAR28 } });

    // ── Order O011: CANCELLED ─────────────────────────────────────────────────
    const o011 = await db.order.create({
      data: {
        code: "GK-2026-0011", clientId: nesya.id,
        type: "PACKAGE", servicePackageId: pkgLogoBasic.id, finalPrice: 150_000,
        status: "CANCELLED", revisionCount: 0,
        briefData: { projectName: "Logo Brand Makanan Ringan", goals: "Logo untuk brand makanan ringan.", styleNotes: "Bright, fun" },
        createdAt: APR1, updatedAt: APR5,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o011.id, fromStatus: null,              toStatus: "PENDING_PAYMENT", changedById: nesya.id,  changedAt: APR1 },
      { orderId: o011.id, fromStatus: "PENDING_PAYMENT", toStatus: "CANCELLED",      changedById: nesya.id,  changedAt: APR5, note: "Batalkan saja, ganti konsep" },
    ] });
    await db.payment.create({ data: { orderId: o011.id, amount: 150_000, qrisImageUrl: "/qris-sample.svg", status: "REJECTED", rejectReason: "Dibatalkan oleh klien" } });

    // ── Order O012: DELIVERED (untuk PAID_OUT payroll) ────────────────────────
    const o012 = await db.order.create({
      data: {
        code: "GK-2026-0012", clientId: gilang.id, designerId: nara.id,
        type: "PACKAGE", servicePackageId: pkgBanner.id, finalPrice: 350_000,
        status: "DELIVERED", revisionCount: 0, adminApprovedDeliverable: true,
        briefData: { projectName: "Banner Ads Bootcamp Programming", goals: "Set 5 banner untuk kampanye bootcamp programming online.", targetAudience: "Mahasiswa IT & fresh graduate", styleNotes: "Tech vibe, dark mode, coding imagery", deadline: "2026-04-20" },
        createdAt: APR1, updatedAt: APR15,
      },
    });
    await db.orderStatusHistory.createMany({ data: [
      { orderId: o012.id, fromStatus: null,                 toStatus: "PENDING_PAYMENT",      changedById: gilang.id, changedAt: APR1 },
      { orderId: o012.id, fromStatus: "PENDING_PAYMENT",    toStatus: "WAITING_VERIFICATION", changedById: gilang.id, changedAt: APR3, note: "Proof" },
      { orderId: o012.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",              changedById: admin.id,  changedAt: APR5, note: "Ok" },
      { orderId: o012.id, fromStatus: "PAID",               toStatus: "ASSIGNED",             changedById: admin.id,  changedAt: APR5, note: "Ke Nara" },
      { orderId: o012.id, fromStatus: "ASSIGNED",           toStatus: "IN_PROGRESS",          changedById: nara.id,   changedAt: APR10 },
      { orderId: o012.id, fromStatus: "IN_PROGRESS",        toStatus: "DONE",                 changedById: nara.id,   changedAt: APR15 },
      { orderId: o012.id, fromStatus: "DONE",               toStatus: "DELIVERED",            changedById: gilang.id, changedAt: APR15, note: "Mantap, terima kasih!" },
    ] });
    await db.payment.create({ data: { orderId: o012.id, amount: 350_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: APR5, uploadedAt: APR3 } });

    // Payroll PAID_OUT untuk O012
    const batch = await db.payoutBatch.create({
      data: { periodMonth: "2026-04", totalAmount: h(350_000 * 0.7), processedById: admin.id, processedAt: APR15, note: "Payout April 2026" },
    });
    await db.payrollEntry.create({ data: { orderId: o012.id, designerId: nara.id, orderTotal: 350_000, commissionAmount: h(350_000 * 0.7), companyShare: h(350_000 * 0.3), status: "PAID_OUT", accruedAt: APR15, paidOutAt: APR15, payoutBatchId: batch.id } });
    await db.cashFlow.create({ data: { type: "INCOME", source: "ORDER_PAYMENT", amount: 350_000, description: "Pembayaran order GK-2026-0012", sourceOrderId: o012.id, recordedById: admin.id, occurredAt: APR5 } });
    await db.cashFlow.create({ data: { type: "INCOME", source: "COMMISSION_SHARE", amount: h(350_000 * 0.3), description: "Bagian perusahaan 30% - GK-2026-0012", sourceOrderId: o012.id, recordedById: admin.id, occurredAt: APR15 } });

    // ── 7. Recurring Cashflows (Mar, Apr, May) ────────────────────────────────
    const recurringInsert = async (month: number, day: number, catId: string, desc: string, amount: number) => {
      await db.cashFlow.create({ data: { type: "EXPENSE", source: "RECURRING_EXPENSE", categoryId: catId, amount, description: desc, recordedById: admin.id, occurredAt: new Date(2026, month, day) } });
    };
    const manualInsert = async (month: number, day: number, catId: string, desc: string, amount: number) => {
      await db.cashFlow.create({ data: { type: "EXPENSE", source: "MANUAL", categoryId: catId, amount, description: desc, recordedById: admin.id, occurredAt: new Date(2026, month, day) } });
    };

    // Maret (month=2 karena 0-index)
    await recurringInsert(2, 1,  ecSoftware.id, "Adobe CC - Maret 2026", 15_000);
    await recurringInsert(2, 5,  ecOp.id,       "WiFi Indihome - Maret 2026", 180_000);
    await recurringInsert(2, 10, ecSoftware.id, "Canva Pro - Maret 2026", 60_000);
    await recurringInsert(2, 1,  ecMarketing.id, "Google Ads - Maret 2026", 200_000);
    await manualInsert(2, 12, ecAlat.id, "Beli kertas A3 untuk mockup", 85_000);

    // April (month=3)
    await recurringInsert(3, 1,  ecSoftware.id, "Adobe CC - April 2026", 15_000);
    await recurringInsert(3, 5,  ecOp.id,       "WiFi Indihome - April 2026", 180_000);
    await recurringInsert(3, 10, ecSoftware.id, "Canva Pro - April 2026", 60_000);
    await recurringInsert(3, 1,  ecMarketing.id, "Google Ads - April 2026", 200_000);

    // Mei (month=4)
    await recurringInsert(4, 1,  ecSoftware.id, "Adobe CC - Mei 2026", 15_000);
    await recurringInsert(4, 5,  ecOp.id,       "WiFi Indihome - Mei 2026", 180_000);
    await recurringInsert(4, 10, ecSoftware.id, "Canva Pro - Mei 2026", 60_000);
    await recurringInsert(4, 1,  ecMarketing.id, "Google Ads - Mei 2026", 200_000);

    // Tandai recurring sudah generate sampai bulan ini (Mei)
    await db.recurringExpense.update({ where: { id: "re-wifi" },   data: { lastGeneratedAt: new Date("2026-05-05") } });
    await db.recurringExpense.update({ where: { id: "re-adobe" },  data: { lastGeneratedAt: new Date("2026-05-01") } });
    await db.recurringExpense.update({ where: { id: "re-canva" },  data: { lastGeneratedAt: new Date("2026-05-10") } });
    await db.recurringExpense.update({ where: { id: "re-gsheet" }, data: { lastGeneratedAt: new Date("2026-05-01") } });

    // ── 8. Notifications (sinkron dengan data di atas) ─────────────────────────
    console.log("  → Notifications...");

    // Admin — unread: 3
    await db.notification.createMany({ data: [
      { userId: admin.id, type: "PAYMENT_NEW",   title: "Verifikasi pembayaran",   message: "Order GK-2026-0006 menunggu verifikasi pembayaran dari Tara.",    link: "/admin/payments",           isRead: false, createdAt: MAR25 },
      { userId: admin.id, type: "QUOTE_NEW",     title: "Permintaan kustom baru",   message: "Klien Nesya Larasati mengajukan permintaan kustom Visual Wisuda.", link: "/admin/quotes",             isRead: false, createdAt: MAR10 },
      { userId: admin.id, type: "ORDER_DONE",    title: "Review hasil desain",      message: "Order GK-2026-0009 selesai dikerjakan. Admin review diperlukan.",   link: "/admin/orders/" + o009.id,   isRead: false, createdAt: APR5 },
      { userId: admin.id, type: "PAYMENT_VERIFIED", title: "Pembayaran diverifikasi",message: "Pembayaran GK-2026-0010 berhasil diverifikasi.",                   link: "/admin/orders/" + o010.id,  isRead: true,  createdAt: MAR28 },
      { userId: admin.id, type: "PAYMENT_VERIFIED", title: "Pembayaran diverifikasi",message: "Pembayaran GK-2026-0001 berhasil diverifikasi.",                   link: "/admin/orders/" + o001.id,  isRead: true,  createdAt: MAR5 },
      { userId: admin.id, type: "ORDER_ASSIGNED",   title: "Desainer ditugaskan",    message: "GK-2026-0010 berhasil ditugaskan ke Nara.",                        link: "/admin/orders/" + o010.id,  isRead: true,  createdAt: MAR28 },
      { userId: admin.id, type: "ORDER_ASSIGNED",   title: "Desainer ditugaskan",    message: "GK-2026-0008 berhasil ditugaskan ke Arka.",                        link: "/admin/orders/" + o008.id,  isRead: true,  createdAt: MAR28 },
      { userId: admin.id, type: "PAYMENT_VERIFIED", title: "Pembayaran diverifikasi",message: "Pembayaran GK-2026-0012 diverifikasi.",                             link: "/admin/orders/" + o012.id,  isRead: true,  createdAt: APR5 },
    ] });

    // Tara — unread: 1 (QUOTE_OFFERED)
    await db.notification.createMany({ data: [
      { userId: tara.id, type: "ORDER_QUOTE",  title: "Penawaran harga diterima",   message: "Admin telah mengirim penawaran untuk GK-2026-0005 — Rp350.000.",  link: "/dashboard/orders/" + o005.id, isRead: false, createdAt: MAR20 },
      { userId: tara.id, type: "ORDER_DONE",   title: "Pesanan siap di-review",     message: "Order GK-2026-0001 telah selesai dan terkirim. Terima kasih!",    link: "/dashboard/orders/" + o001.id, isRead: true,  createdAt: MAR18 },
      { userId: tara.id, type: "PAYMENT_VERIFIED", title: "Pembayaran terverifikasi",message: "Pembayaran order GK-2026-0001 telah disetujui.",                  link: "/dashboard/orders/" + o001.id, isRead: true,  createdAt: MAR5 },
      { userId: tara.id, type: "PAYMENT_VERIFIED", title: "Pembayaran terverifikasi",message: "Pembayaran order GK-2026-0010 telah disetujui.",                  link: "/dashboard/orders/" + o010.id, isRead: true,  createdAt: MAR28 },
    ] });

    // Nesya — unread: 2
    await db.notification.createMany({ data: [
      { userId: nesya.id, type: "PAYMENT_VERIFIED", title: "Pembayaran diverifikasi",message: "Pembayaran GK-2026-0007 telah diverifikasi. Admin akan segera assign desainer.", link: "/dashboard/orders/" + o007.id, isRead: true, createdAt: MAR25 },
      { userId: nesya.id, type: "ORDER_PROGRESS",   title: "Pesanan dikerjakan",     message: "Order GK-2026-0009 sedang dikerjakan oleh Nara.",                                       link: "/dashboard/orders/" + o009.id, isRead: false, createdAt: APR1 },
    ] });

    // Gilang — unread: 1
    await db.notification.createMany({ data: [
      { userId: gilang.id, type: "ORDER_REVISION",  title: "Revisi dari desainer",   message: "Arka telah mengirim revisi untuk GK-2026-0008. Silakan cek hasilnya.", link: "/dashboard/orders/" + o008.id, isRead: false, createdAt: MAR28 },
      { userId: gilang.id, type: "PAYMENT_VERIFIED", title: "Pembayaran diverifikasi",message: "Pembayaran GK-2026-0004 diverifikasi.",                                  link: "/dashboard/orders/" + o004.id, isRead: true,  createdAt: MAR18 },
      { userId: gilang.id, type: "ORDER_DELIVERED",  title: "Pesanan selesai",        message: "GK-2026-0012 — Banner Ads Bootcamp telah selesai dan terkirim.",           link: "/dashboard/orders/" + o012.id, isRead: true,  createdAt: APR15 },
    ] });

    // Arka — unread: 1 (REVISION)
    await db.notification.createMany({ data: [
      { userId: arka.id, type: "ORDER_REVISION",   title: "Klien minta revisi",      message: "Gilang meminta revisi untuk GK-2026-0008 — font terlalu kecil.",  link: "/designer/tasks/" + o008.id, isRead: false, createdAt: APR3 },
      { userId: arka.id, type: "ORDER_ASSIGNED",   title: "Order baru",              message: "Anda mendapat order GK-2026-0010 — Kartu Nama Premium.",            link: "/designer/tasks/" + o010.id, isRead: true,  createdAt: MAR28 },
      { userId: arka.id, type: "ORDER_ASSIGNED",   title: "Order baru",              message: "Anda mendapat order GK-2026-0001 — Logo Pro + Guideline.",           link: "/designer/tasks/" + o001.id, isRead: true,  createdAt: MAR5 },
    ] });

    // Nara — unread: 2
    await db.notification.createMany({ data: [
      { userId: nara.id, type: "ORDER_ASSIGNED", title: "Order baru ditugaskan",    message: "Anda mendapat order GK-2026-0010 — Kartu Nama Premium untuk Tara.",    link: "/designer/tasks/" + o010.id, isRead: false, createdAt: MAR28 },
      { userId: nara.id, type: "ORDER_DONE",     title: "Tandai selesai",           message: "Order GK-2026-0009 — Story Template. Jangan lupa upload deliverable.",   link: "/designer/tasks/" + o009.id, isRead: false, createdAt: MAR28 },
      { userId: nara.id, type: "ORDER_ASSIGNED", title: "Order baru ditugaskan",    message: "Anda mendapat order GK-2026-0004 — Feed Instagram 9 Slot.",            link: "/designer/tasks/" + o004.id, isRead: true,  createdAt: MAR18 },
      { userId: nara.id, type: "ORDER_ASSIGNED", title: "Order baru ditugaskan",    message: "Anda mendapat order GK-2026-0012 — Banner Ads Bootcamp Programming.", link: "/designer/tasks/" + o012.id, isRead: true,  createdAt: APR5 },
    ] });
  }

  console.log("\n✅ Seed selesai!");
  console.log("──────────────────────────────────");
  console.log("Akun demo:");
  console.log("  Admin:    admin@gridkita.id   / gridkita2026");
  console.log("  Designer: arka@gridkita.id    / designer123");
  console.log("  Designer: nara@gridkita.id    / designer123");
  console.log("  Client:   tara@example.com    / client123");
  console.log("  Client:   nesya@example.com   / client123");
  console.log("  Client:   gilang@example.com  / client123");
  console.log("──────────────────────────────────");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => db.$disconnect());
