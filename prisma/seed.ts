import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database GridKita...");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log("  → Users...");
  const adminPass    = await bcrypt.hash("gridkita2026", 12);
  const designerPass = await bcrypt.hash("designer123",  12);
  const clientPass   = await bcrypt.hash("client123",    12);

  const admin = await db.user.upsert({
    where: { email: "admin@gridkita.id" },
    update: {},
    create: { email: "admin@gridkita.id", password: adminPass, name: "Firta Aulia", role: "ADMIN", phone: "081200000001", avatarUrl: "https://i.pravatar.cc/120?img=47", isActive: true },
  });

  const wahyu = await db.user.upsert({
    where: { email: "wahyu@gridkita.id" },
    update: {},
    create: { email: "wahyu@gridkita.id", password: designerPass, name: "Wahyu Pratama", role: "DESIGNER", phone: "081200000002", bankAccount: "BCA 1234567890 a.n. Wahyu Pratama", avatarUrl: "https://i.pravatar.cc/120?img=12", isActive: true },
  });

  const raffi = await db.user.upsert({
    where: { email: "raffi@gridkita.id" },
    update: {},
    create: { email: "raffi@gridkita.id", password: designerPass, name: "Raffi Hidayat", role: "DESIGNER", phone: "081200000003", bankAccount: "Mandiri 9876543210 a.n. Raffi Hidayat", avatarUrl: "https://i.pravatar.cc/120?img=33", isActive: true },
  });

  await db.user.upsert({
    where: { email: "nabil@gridkita.id" },
    update: {},
    create: { email: "nabil@gridkita.id", password: designerPass, name: "Nabil Akbar", role: "DESIGNER", phone: "081200000004", bankAccount: "BNI 5556667778 a.n. Nabil Akbar", avatarUrl: "https://i.pravatar.cc/120?img=14", isActive: false },
  });

  const rifat = await db.user.upsert({
    where: { email: "rifat@example.com" },
    update: {},
    create: { email: "rifat@example.com", password: clientPass, name: "Rifat Setiawan", role: "CLIENT", phone: "081299999991", avatarUrl: "https://i.pravatar.cc/120?img=68", isActive: true },
  });

  const amelia = await db.user.upsert({
    where: { email: "amelia@example.com" },
    update: {},
    create: { email: "amelia@example.com", password: clientPass, name: "Amelia Putri", role: "CLIENT", phone: "081299999992", avatarUrl: "https://i.pravatar.cc/120?img=45", isActive: true },
  });

  const budi = await db.user.upsert({
    where: { email: "budi@example.com" },
    update: {},
    create: { email: "budi@example.com", password: clientPass, name: "Budi Santoso", role: "CLIENT", phone: "081299999993", avatarUrl: "https://i.pravatar.cc/120?img=52", isActive: true },
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
  const pkgs = [
    { categoryId: catBranding.id, name: "Logo Basic", slug: "logo-basic", description: "Desain logo sederhana untuk usaha kecil. Cocok untuk UMKM dan toko online baru.", features: ["1 konsep logo", "2x revisi minor", "File PNG + JPG", "Estimasi 3 hari kerja"], basePrice: 150_000, estimatedDays: 3, thumbnailPath: "https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catBranding.id, name: "Logo Pro + Guideline", slug: "logo-pro", description: "Logo profesional plus brand guideline 8 halaman. Dilengkapi mockup aplikasi logo.", features: ["3 konsep logo", "5x revisi", "File master AI/SVG/PDF", "Brand guideline 8 hal", "Mockup aplikasi"], basePrice: 750_000, estimatedDays: 7, thumbnailPath: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop", isActive: true, isPopular: true },
    { categoryId: catSocial.id, name: "Feed Instagram 9 Slot", slug: "feed-instagram-9", description: "Desain 9 konten feed Instagram dengan tema serasi.", features: ["9 desain feed", "Konsep tema selaras", "2x revisi per slot", "PNG 1080x1080"], basePrice: 450_000, estimatedDays: 5, thumbnailPath: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop", isActive: true, isPopular: true },
    { categoryId: catSocial.id, name: "Story Template 6 Slide", slug: "story-template", description: "Template story Instagram editable untuk promo & engagement.", features: ["6 template story", "File Canva editable", "1x revisi"], basePrice: 200_000, estimatedDays: 3, thumbnailPath: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catPrint.id, name: "Poster Promo A3", slug: "poster-promo-a3", description: "Desain poster promo siap cetak ukuran A3.", features: ["File PDF print-ready", "300 DPI CMYK", "2x revisi"], basePrice: 175_000, estimatedDays: 2, thumbnailPath: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catPrint.id, name: "Brosur Tri-fold", slug: "brosur-trifold", description: "Brosur tiga lipat A4 untuk produk/jasa Anda.", features: ["Desain 2 sisi", "Print-ready", "3x revisi"], basePrice: 300_000, estimatedDays: 4, thumbnailPath: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catPrint.id, name: "Kartu Nama Premium", slug: "kartu-nama-premium", description: "Desain kartu nama dua sisi dengan finishing premium.", features: ["2 sisi desain", "File PDF print", "1x revisi"], basePrice: 100_000, estimatedDays: 2, thumbnailPath: "https://images.unsplash.com/photo-1600172454520-134a85b1c021?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catDigital.id, name: "Banner Ads Set", slug: "banner-ads-set", description: "Set 5 banner iklan ukuran umum (FB, IG, GDN).", features: ["5 ukuran banner", "PNG + GIF", "2x revisi"], basePrice: 350_000, estimatedDays: 4, thumbnailPath: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
    { categoryId: catDigital.id, name: "Landing Page Visual", slug: "landing-page-visual", description: "Konsep visual landing page (Figma) siap dikembangkan oleh developer.", features: ["Wireframe + mockup", "Mobile + desktop", "3x revisi"], basePrice: 600_000, estimatedDays: 6, thumbnailPath: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&auto=format&fit=crop", isActive: true, isPopular: false },
  ];

  for (const pkg of pkgs) {
    await db.servicePackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: { ...pkg, features: pkg.features },
    });
  }

  // ── 4. Portfolio ──────────────────────────────────────────────────────────
  console.log("  → Portfolio...");
  const portfolioData = [
    { title: "Rebranding Kopi Senja", description: "Identitas visual lengkap untuk coffee shop boutique di Surabaya, dari logo, kemasan hingga signage.", category: "Branding", images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop", "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1600&auto=format&fit=crop"] },
    { title: "Konten Feed Beauty Brand", description: "Set 27 konten feed Instagram untuk brand skincare lokal selama 3 bulan kampanye.", category: "Sosial Media", images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop"] },
    { title: "Poster Festival Musik Kampus", description: "Visual poster, IG feed dan e-flyer untuk Festival Musik Mahasiswa UNESA.", category: "Print & Marketing", images: ["https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1600&auto=format&fit=crop"] },
    { title: "Logo & Menu Resto Padang", description: "Logo modern dan desain menu cetak untuk Restoran Padang Selera Bunda.", category: "Branding", images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop"] },
    { title: "Banner Ads Online Course", description: "Kampanye iklan banner & landing visual untuk platform kursus online berbahasa Indonesia.", category: "Digital Marketing", images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop"] },
    { title: "Brosur & Katalog Produk Fashion", description: "Katalog koleksi musim panas brand fashion lokal dengan layout editorial yang elegan.", category: "Print & Marketing", images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop"] },
    { title: "Identity & Stationery Klinik Gigi", description: "Identitas visual + stationery untuk klinik gigi di Sidoarjo.", category: "Branding", images: ["https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1600&auto=format&fit=crop"] },
    { title: "Story Template Café", description: "Story template editable bulanan untuk café dengan tema seasonal.", category: "Sosial Media", images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&auto=format&fit=crop"] },
  ];

  for (const pf of portfolioData) {
    const exists = await db.portfolio.findFirst({ where: { title: pf.title } });
    if (!exists) {
      await db.portfolio.create({
        data: {
          title: pf.title,
          description: pf.description,
          category: pf.category,
          createdById: admin.id,
          images: {
            create: pf.images.map((url, i) => ({ path: url, order: i })),
          },
        },
      });
    }
  }

  // ── 5. Expense Categories + Recurring Expenses ────────────────────────────
  console.log("  → Keuangan...");
  let ecOp = await db.expenseCategory.findFirst({ where: { name: "Operasional" } });
  if (!ecOp) ecOp = await db.expenseCategory.create({ data: { name: "Operasional", isOperational: true } });

  let ecSoftware = await db.expenseCategory.findFirst({ where: { name: "Software & Lisensi" } });
  if (!ecSoftware) ecSoftware = await db.expenseCategory.create({ data: { name: "Software & Lisensi", isOperational: true } });

  let ecMarketing = await db.expenseCategory.findFirst({ where: { name: "Marketing" } });
  if (!ecMarketing) ecMarketing = await db.expenseCategory.create({ data: { name: "Marketing", isOperational: false } });

  let ecAlat = await db.expenseCategory.findFirst({ where: { name: "Alat & Perlengkapan" } });
  if (!ecAlat) ecAlat = await db.expenseCategory.create({ data: { name: "Alat & Perlengkapan", isOperational: false } });

  await db.recurringExpense.upsert({
    where: { id: "re-wifi-indihome" },
    update: {},
    create: { id: "re-wifi-indihome", categoryId: ecOp.id, name: "WiFi Indihome", amount: 180_000, recurrenceDay: 5, isActive: true },
  });
  await db.recurringExpense.upsert({
    where: { id: "re-adobe-cc" },
    update: {},
    create: { id: "re-adobe-cc", categoryId: ecSoftware.id, name: "Adobe Creative Cloud (1 seat)", amount: 15_000, recurrenceDay: 1, isActive: true },
  });
  await db.recurringExpense.upsert({
    where: { id: "re-canva-pro" },
    update: {},
    create: { id: "re-canva-pro", categoryId: ecSoftware.id, name: "Canva Pro", amount: 60_000, recurrenceDay: 10, isActive: true },
  });

  // ── 6. Demo Orders (satu order DELIVERED untuk demo payroll) ──────────────
  console.log("  → Demo orders...");

  // Cek apakah sudah ada, jangan duplikat
  const existingOrder = await db.order.findFirst({ where: { code: "GK-2026-0001" } });
  if (!existingOrder) {
    // Cari package
    const logoPro = await db.servicePackage.findUnique({ where: { slug: "logo-pro" } });

    const order = await db.order.create({
      data: {
        code: "GK-2026-0001",
        clientId: rifat.id,
        designerId: wahyu.id,
        type: "PACKAGE",
        servicePackageId: logoPro?.id,
        finalPrice: 750_000,
        status: "DELIVERED",
        revisionCount: 1,
        briefData: {
          projectName: "Logo Brand Skincare 'Lumiere'",
          goals: "Logo elegan, feminine, modern untuk brand skincare lokal premium.",
          targetAudience: "Wanita 25-40 tahun, segmen menengah atas",
          styleNotes: "Minimalist, serif font, gold-rose color scheme",
          deadline: "2026-03-15",
        },
      },
    });

    // Status history
    const historySteps = [
      { from: null,              to: "PENDING_PAYMENT",      changedBy: rifat.id,  note: null },
      { from: "PENDING_PAYMENT", to: "WAITING_VERIFICATION", changedBy: rifat.id,  note: "Bukti transfer diunggah" },
      { from: "WAITING_VERIFICATION", to: "PAID",            changedBy: admin.id,  note: "Pembayaran terverifikasi" },
      { from: "PAID",            to: "ASSIGNED",             changedBy: admin.id,  note: "Ditugaskan ke Wahyu" },
      { from: "ASSIGNED",        to: "IN_PROGRESS",          changedBy: wahyu.id,  note: null },
      { from: "IN_PROGRESS",     to: "DONE",                 changedBy: wahyu.id,  note: null },
      { from: "DONE",            to: "REVISION",             changedBy: rifat.id,  note: "Tolong color palette lebih hangat" },
      { from: "REVISION",        to: "IN_PROGRESS",          changedBy: wahyu.id,  note: null },
      { from: "IN_PROGRESS",     to: "DONE",                 changedBy: wahyu.id,  note: null },
      { from: "DONE",            to: "DELIVERED",            changedBy: rifat.id,  note: "Hasil sudah sesuai, terima kasih!" },
    ] as const;

    for (const step of historySteps) {
      await db.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: step.from as never,
          toStatus: step.to as never,
          changedById: step.changedBy,
          note: step.note ?? undefined,
        },
      });
    }

    // Payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: 750_000,
        qrisImageUrl: "/qris-sample.svg",
        proofPath: null,
        status: "APPROVED",
        verifiedById: admin.id,
        verifiedAt: new Date("2026-03-01T11:00:00Z"),
        uploadedAt: new Date("2026-03-01T10:00:00Z"),
      },
    });

    // Payroll entry (70/30)
    const commission = Math.round(750_000 * 0.7); // 525_000
    const company    = 750_000 - commission;       // 225_000

    await db.payrollEntry.create({
      data: {
        orderId: order.id,
        designerId: wahyu.id,
        orderTotal: 750_000,
        commissionAmount: commission,
        companyShare: company,
        status: "ACCRUED",
        accruedAt: new Date("2026-03-12T14:00:00Z"),
      },
    });

    // CashFlow pemasukan
    await db.cashFlow.create({
      data: {
        type: "INCOME",
        source: "ORDER_PAYMENT",
        amount: 750_000,
        description: "Pembayaran order GK-2026-0001",
        sourceOrderId: order.id,
        recordedById: admin.id,
        occurredAt: new Date("2026-03-01T11:00:00Z"),
      },
    });

    await db.cashFlow.create({
      data: {
        type: "INCOME",
        source: "COMMISSION_SHARE",
        amount: company,
        description: "Bagian perusahaan 30% - GK-2026-0001",
        sourceOrderId: order.id,
        recordedById: admin.id,
        occurredAt: new Date("2026-03-12T14:00:00Z"),
      },
    });

    // Satu order PENDING_PAYMENT untuk demo klien
    const posterPkg = await db.servicePackage.findUnique({ where: { slug: "poster-promo-a3" } });
    const order2 = await db.order.create({
      data: {
        code: "GK-2026-0002",
        clientId: rifat.id,
        type: "PACKAGE",
        servicePackageId: posterPkg?.id,
        finalPrice: 175_000,
        status: "PENDING_PAYMENT",
        revisionCount: 0,
        briefData: {
          projectName: "Poster Promo Diskon Lebaran",
          goals: "Poster A3 cetak untuk promo hari raya toko fashion.",
          styleNotes: "Bold typography, merah-emas, vibe festive",
        },
      },
    });
    await db.orderStatusHistory.create({
      data: { orderId: order2.id, toStatus: "PENDING_PAYMENT", changedById: rifat.id },
    });
    await db.payment.create({
      data: { orderId: order2.id, amount: 175_000, qrisImageUrl: "/qris-sample.svg", status: "PENDING" },
    });

    // Satu custom order QUOTE_REQUESTED
    const order3 = await db.order.create({
      data: {
        code: "GK-2026-0003",
        clientId: amelia.id,
        type: "CUSTOM",
        customDescription: "Saya butuh visual identity lengkap untuk acara wisuda kampus: poster, e-flyer, IG feed 5 slot, dan banner panggung.",
        finalPrice: 0,
        status: "QUOTE_REQUESTED",
        revisionCount: 0,
        briefData: {
          projectName: "Visual Wisuda Universitas",
          goals: "Identitas visual menyeluruh untuk acara wisuda UNESA.",
          deadline: "2026-04-20",
        },
      },
    });
    await db.orderStatusHistory.create({
      data: { orderId: order3.id, toStatus: "QUOTE_REQUESTED", changedById: amelia.id },
    });

    // Satu order IN_PROGRESS untuk designer demo
    const feedPkg = await db.servicePackage.findUnique({ where: { slug: "feed-instagram-9" } });
    const order4 = await db.order.create({
      data: {
        code: "GK-2026-0004",
        clientId: budi.id,
        designerId: raffi.id,
        type: "PACKAGE",
        servicePackageId: feedPkg?.id,
        finalPrice: 450_000,
        status: "IN_PROGRESS",
        revisionCount: 0,
        briefData: {
          projectName: "Konten Feed IG Café Senja",
          goals: "9 feed engagement bulan promosi grand opening cabang baru.",
          targetAudience: "Mahasiswa & pekerja kantoran 20-30 tahun",
          styleNotes: "Warm, golden hour vibe",
          deadline: "2026-04-01",
        },
      },
    });
    await db.orderStatusHistory.create({ data: { orderId: order4.id, toStatus: "PENDING_PAYMENT",      changedById: budi.id } });
    await db.orderStatusHistory.create({ data: { orderId: order4.id, fromStatus: "PENDING_PAYMENT", toStatus: "WAITING_VERIFICATION", changedById: budi.id } });
    await db.orderStatusHistory.create({ data: { orderId: order4.id, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID",            changedById: admin.id } });
    await db.orderStatusHistory.create({ data: { orderId: order4.id, fromStatus: "PAID",            toStatus: "ASSIGNED",             changedById: admin.id } });
    await db.orderStatusHistory.create({ data: { orderId: order4.id, fromStatus: "ASSIGNED",        toStatus: "IN_PROGRESS",          changedById: raffi.id } });
    await db.payment.create({
      data: { orderId: order4.id, amount: 450_000, qrisImageUrl: "/qris-sample.svg", status: "APPROVED", verifiedById: admin.id, verifiedAt: new Date() },
    });

    // Recurring cashflow bulan berjalan
    const now = new Date();
    await db.cashFlow.create({ data: { type: "EXPENSE", source: "RECURRING_EXPENSE", categoryId: ecOp.id, amount: 180_000, description: "WiFi Indihome - Maret 2026", sourceRecurringId: "re-wifi-indihome", recordedById: admin.id, occurredAt: new Date("2026-03-05") } });
    await db.cashFlow.create({ data: { type: "EXPENSE", source: "RECURRING_EXPENSE", categoryId: ecSoftware.id, amount: 15_000, description: "Adobe CC - Maret 2026", sourceRecurringId: "re-adobe-cc", recordedById: admin.id, occurredAt: new Date("2026-03-01") } });
    await db.cashFlow.create({ data: { type: "EXPENSE", source: "RECURRING_EXPENSE", categoryId: ecSoftware.id, amount: 60_000, description: "Canva Pro - Maret 2026", sourceRecurringId: "re-canva-pro", recordedById: admin.id, occurredAt: new Date("2026-03-10") } });
    await db.cashFlow.create({ data: { type: "EXPENSE", source: "MANUAL", categoryId: ecAlat.id, amount: 85_000, description: "Beli kertas A3 untuk mockup", recordedById: admin.id, occurredAt: new Date("2026-03-12") } });

    // Notifikasi demo
    await db.notification.createMany({
      data: [
        { userId: admin.id, type: "PAYMENT_NEW", title: "Bukti pembayaran baru", message: "Order GK-2026-0001 menunggu verifikasi.", link: `/admin/payments`, isRead: true },
        { userId: rifat.id, type: "PAYMENT_VERIFIED", title: "Pembayaran terverifikasi", message: "Pembayaran order GK-2026-0001 telah disetujui.", link: `/dashboard/orders/${order.id}`, isRead: true },
        { userId: rifat.id, type: "ORDER_DONE", title: "Pesanan siap di-review", message: "Order GK-2026-0001 telah selesai dikerjakan.", link: `/dashboard/orders/${order.id}`, isRead: false },
        { userId: wahyu.id, type: "ORDER_ASSIGNED", title: "Order baru ditugaskan", message: "Anda mendapat order GK-2026-0001.", link: `/designer/tasks/${order.id}`, isRead: true },
        { userId: admin.id, type: "QUOTE_NEW", title: "Permintaan kustom baru", message: "Klien Amelia Putri mengajukan permintaan kustom Visual Wisuda.", link: `/admin/quotes`, isRead: false },
      ],
    });

    // Tandai recurring sudah generate bulan ini
    await db.recurringExpense.update({ where: { id: "re-wifi-indihome" }, data: { lastGeneratedAt: new Date("2026-03-05") } });
    await db.recurringExpense.update({ where: { id: "re-adobe-cc" },      data: { lastGeneratedAt: new Date("2026-03-01") } });
    await db.recurringExpense.update({ where: { id: "re-canva-pro" },     data: { lastGeneratedAt: new Date("2026-03-10") } });
  }

  console.log("\n✅ Seed selesai!");
  console.log("──────────────────────────────────");
  console.log("Akun demo:");
  console.log("  Admin:    admin@gridkita.id   / gridkita2026");
  console.log("  Designer: wahyu@gridkita.id   / designer123");
  console.log("  Designer: raffi@gridkita.id   / designer123");
  console.log("  Client:   rifat@example.com   / client123");
  console.log("  Client:   amelia@example.com  / client123");
  console.log("──────────────────────────────────");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => db.$disconnect());
