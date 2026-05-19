# Mock → MySQL Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti seluruh mock data (`src/lib/mock/`) dengan MySQL 8.4 nyata menggunakan Prisma ORM, Auth.js v5 Credentials Provider, dan real Server Actions bermutasi DB.

**Architecture:**
Semua read data saat ini ada di Server Components yang mengimpor dari `src/lib/mock/*.ts`.
Kita akan buat `src/lib/db.ts` (Prisma client singleton), tulis query functions di `src/lib/queries/*.ts` dengan signature identik mock, lalu swap import satu modul per satu — halaman tidak perlu diubah sama sekali sampai Task 7.
Auth.js v5 menggantikan cookie mock (`gk_user_id`) dengan JWT session + Prisma Adapter.

**Tech Stack:** Next.js 16 · Prisma 6 · MySQL 8.4 (FlyEnv) · Auth.js v5 (next-auth@5) · bcryptjs · multipart-formdata (Next.js Route Handler)

**MySQL path:** `C:/Program Files/FlyEnv-Data/app/mysql-8.4.9/mysql-8.4.9-winx64/bin/mysql.exe`

---

## File Map — Yang Dibuat / Diubah

| File | Aksi | Tanggung Jawab |
|---|---|---|
| `.env.local` | Buat | `DATABASE_URL`, `AUTH_SECRET` |
| `prisma/schema.prisma` | Buat | 15 tabel sesuai PRD §4.4 |
| `prisma/seed.ts` | Buat | Seed dari mock data (dev only) |
| `src/lib/db.ts` | Buat | Prisma client singleton |
| `src/lib/queries/users.ts` | Buat | `userById`, `activeDesigners`, dll |
| `src/lib/queries/catalog.ts` | Buat | `packages`, `categories`, `packageBySlug` |
| `src/lib/queries/portfolio.ts` | Buat | `portfolios`, `portfolioById` |
| `src/lib/queries/orders.ts` | Buat | `ordersByClient`, `orderById`, history, payment |
| `src/lib/queries/finance.ts` | Buat | payroll entries, cashflow, recurring |
| `src/lib/queries/notifications.ts` | Buat | `notificationsByUser`, `unreadCount` |
| `src/lib/queries/analytics.ts` | Buat | KPI, chart data |
| `src/lib/auth.ts` | Buat | Auth.js v5 config (Credentials + Prisma Adapter) |
| `src/lib/auth-mock.ts` | **Ubah** | `getCurrentUser` baca dari Auth.js session |
| `src/middleware.ts` → `src/proxy.ts` | Buat | RBAC prefix guard (Next 16: `proxy.ts`) |
| `src/app/actions/auth.ts` | **Ubah** | signIn via Auth.js, bukan cookie manual |
| `src/app/actions/orders.ts` | Buat | `createOrder`, `submitBrief`, `cancelOrder` |
| `src/app/actions/payments.ts` | Buat | `uploadProof`, `approvePayment`, `rejectPayment` |
| `src/app/actions/admin.ts` | Buat | `assignOrder`, `processPayrollBatch`, `sendQuote` |
| `src/app/actions/designer.ts` | Buat | `updateOrderStatus`, `uploadDeliverable` |
| `src/app/actions/cms.ts` | Buat | CRUD portfolio, packages, categories, users |
| `src/app/actions/cashflow.ts` | Buat | `addManualCashFlow`, `toggleRecurring` |
| `src/app/api/files/[id]/route.ts` | Buat | Private file serving dengan auth check |
| `src/app/api/auth/[...nextauth]/route.ts` | Buat | Auth.js route handler |
| 44 pages yang import `@/lib/mock/*` | **Ubah** | Swap ke `@/lib/queries/*` |

---

## Task 1: Instalasi Dependencies

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1.1: Install Prisma & Auth.js**

```bash
cd "e:/Kuliah/Semester 4/Sisfor Manajemen/SIM UAS/gridkita-cms"
npm install prisma @prisma/client
npm install next-auth@5 @auth/prisma-adapter
npm install bcryptjs
npm install @types/bcryptjs --save-dev
npx prisma init --datasource-provider mysql
```

Expected: folder `prisma/` dibuat, `schema.prisma` dibuat, `.env` dibuat.

- [ ] **Step 1.2: Buat `.env.local`**

```bash
# Hapus .env yang dibuat prisma (kita pakai .env.local agar tidak ter-commit)
rm .env
```

Buat file `.env.local`:
```
# MySQL 8.4 via FlyEnv
# Sesuaikan port dan password dengan FlyEnv settings Anda
DATABASE_URL="mysql://root:@127.0.0.1:3306/gridkita_cms"

# Auth.js secret — generate random string
# Jalankan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="GANTI_DENGAN_RANDOM_32_BYTES_HEX"

# Base URL
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 1.3: Pastikan FlyEnv MySQL berjalan**

Buka aplikasi FlyEnv → Start MySQL 8.4 → pastikan port 3306 aktif.

Lalu test koneksi:
```bash
"C:/Program Files/FlyEnv-Data/app/mysql-8.4.9/mysql-8.4.9-winx64/bin/mysql.exe" \
  -u root -p -e "SELECT VERSION();"
```

Expected output: `8.4.x`

- [ ] **Step 1.4: Buat database**

```bash
"C:/Program Files/FlyEnv-Data/app/mysql-8.4.9/mysql-8.4.9-winx64/bin/mysql.exe" \
  -u root -e "CREATE DATABASE IF NOT EXISTS gridkita_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

- [ ] **Step 1.5: Commit**

```bash
git add package.json package-lock.json prisma/ .gitignore
git commit -m "chore: add prisma, next-auth, bcryptjs deps"
```

---

## Task 2: Prisma Schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 2.1: Tulis schema lengkap**

Tulis `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ── Auth.js required tables ─────────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ── Domain tables ────────────────────────────────────────────────────────────

enum Role {
  CLIENT
  DESIGNER
  ADMIN
}

enum OrderStatus {
  QUOTE_REQUESTED
  QUOTE_OFFERED
  PENDING_PAYMENT
  WAITING_VERIFICATION
  PAID
  ASSIGNED
  IN_PROGRESS
  REVISION
  DONE
  DELIVERED
  CANCELLED
}

enum OrderType {
  PACKAGE
  CUSTOM
}

enum PaymentStatus {
  PENDING
  WAITING
  APPROVED
  REJECTED
}

enum PayrollStatus {
  ACCRUED
  PAID_OUT
}

enum CashFlowType {
  INCOME
  EXPENSE
}

enum CashFlowSource {
  ORDER_PAYMENT
  COMMISSION_SHARE
  RECURRING_EXPENSE
  MANUAL
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // bcrypt hash
  name        String
  role        Role     @default(CLIENT)
  phone       String?
  bankAccount String?
  avatarUrl   String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  accounts      Account[]
  sessions      Session[]
  ordersAsClient     Order[]        @relation("ClientOrders")
  ordersAsDesigner   Order[]        @relation("DesignerOrders")
  statusChanges      OrderStatusHistory[]
  paymentsVerified   Payment[]
  deliverablesUploaded Deliverable[]
  payrollEntries     PayrollEntry[]
  payoutBatchesProcessed PayoutBatch[]
  cashFlowsRecorded  CashFlow[]
  notifications      Notification[]
  portfoliosCreated  Portfolio[]
}

model Portfolio {
  id          String           @id @default(cuid())
  title       String
  description String           @db.Text
  category    String
  createdById String
  createdAt   DateTime         @default(now())
  createdBy   User             @relation(fields: [createdById], references: [id])
  images      PortfolioImage[]
}

model PortfolioImage {
  id          String    @id @default(cuid())
  portfolioId String
  path        String
  caption     String?
  order       Int       @default(0)
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}

model ServiceCategory {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String
  icon        String?
  packages    ServicePackage[]
}

model ServicePackage {
  id            String          @id @default(cuid())
  categoryId    String
  name          String
  slug          String          @unique
  description   String          @db.Text
  features      Json            // String[] disimpan sebagai JSON array
  basePrice     Decimal         @db.Decimal(12, 2)
  estimatedDays Int
  thumbnailPath String
  isActive      Boolean         @default(true)
  isPopular     Boolean         @default(false)
  category      ServiceCategory @relation(fields: [categoryId], references: [id])
  orders        Order[]
}

model Order {
  id                String    @id @default(cuid())
  code              String    @unique // GK-2026-0001
  clientId          String
  designerId        String?
  type              OrderType
  servicePackageId  String?
  customDescription String?   @db.Text
  quotedPrice       Decimal?  @db.Decimal(12, 2)
  finalPrice        Decimal   @db.Decimal(12, 2) @default(0)
  status            OrderStatus @default(PENDING_PAYMENT)
  revisionCount     Int       @default(0)
  briefData         Json      // BriefData object
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  client         User              @relation("ClientOrders", fields: [clientId], references: [id])
  designer       User?             @relation("DesignerOrders", fields: [designerId], references: [id])
  servicePackage ServicePackage?   @relation(fields: [servicePackageId], references: [id])
  statusHistory  OrderStatusHistory[]
  attachments    OrderAttachment[]
  payment        Payment?
  deliverables   Deliverable[]
  payrollEntry   PayrollEntry?
}

model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  fromStatus  OrderStatus?
  toStatus    OrderStatus
  changedById String
  changedAt   DateTime    @default(now())
  note        String?     @db.Text
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  changedBy   User        @relation(fields: [changedById], references: [id])
}

model OrderAttachment {
  id           String   @id @default(cuid())
  orderId      String
  path         String   // private: storage/briefs/uuid.ext
  name         String
  uploadedById String
  kind         String   // "BRIEF" | "REFERENCE"
  uploadedAt   DateTime @default(now())
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Payment {
  id           String        @id @default(cuid())
  orderId      String        @unique
  amount       Decimal       @db.Decimal(12, 2)
  qrisImageUrl String
  proofPath    String?       // private: storage/payment-proofs/uuid.ext
  status       PaymentStatus @default(PENDING)
  verifiedById String?
  verifiedAt   DateTime?
  rejectReason String?       @db.Text
  uploadedAt   DateTime?
  order        Order         @relation(fields: [orderId], references: [id])
  verifiedBy   User?         @relation(fields: [verifiedById], references: [id])
}

model Deliverable {
  id         String   @id @default(cuid())
  orderId    String
  designerId String
  path       String   // private: storage/deliverables/uuid.ext
  fileName   String
  mimeType   String
  sizeBytes  Int
  uploadedAt DateTime @default(now())
  order      Order    @relation(fields: [orderId], references: [id])
  designer   User     @relation(fields: [designerId], references: [id])
}

model PayrollEntry {
  id               String        @id @default(cuid())
  orderId          String        @unique
  designerId       String
  orderTotal       Decimal       @db.Decimal(12, 2)
  commissionAmount Decimal       @db.Decimal(12, 2) // 70%
  companyShare     Decimal       @db.Decimal(12, 2) // 30%
  status           PayrollStatus @default(ACCRUED)
  accruedAt        DateTime      @default(now())
  paidOutAt        DateTime?
  payoutBatchId    String?
  order            Order         @relation(fields: [orderId], references: [id])
  designer         User          @relation(fields: [designerId], references: [id])
  payoutBatch      PayoutBatch?  @relation(fields: [payoutBatchId], references: [id])
}

model PayoutBatch {
  id            String         @id @default(cuid())
  periodMonth   String         // "YYYY-MM"
  totalAmount   Decimal        @db.Decimal(12, 2)
  processedById String
  processedAt   DateTime       @default(now())
  note          String?
  processedBy   User           @relation(fields: [processedById], references: [id])
  entries       PayrollEntry[]
}

model ExpenseCategory {
  id            String           @id @default(cuid())
  name          String
  isOperational Boolean          @default(false)
  cashFlows     CashFlow[]
  recurringExpenses RecurringExpense[]
}

model RecurringExpense {
  id              String          @id @default(cuid())
  categoryId      String
  name            String
  amount          Decimal         @db.Decimal(12, 2)
  recurrenceDay   Int             // 1-28
  isActive        Boolean         @default(true)
  lastGeneratedAt DateTime?
  category        ExpenseCategory @relation(fields: [categoryId], references: [id])
  cashFlows       CashFlow[]
}

model CashFlow {
  id                 String          @id @default(cuid())
  type               CashFlowType
  source             CashFlowSource
  categoryId         String?
  amount             Decimal         @db.Decimal(12, 2)
  description        String
  occurredAt         DateTime        @default(now())
  sourceOrderId      String?
  sourceRecurringId  String?
  recordedById       String
  category           ExpenseCategory? @relation(fields: [categoryId], references: [id])
  sourceRecurring    RecurringExpense? @relation(fields: [sourceRecurringId], references: [id])
  recordedBy         User            @relation(fields: [recordedById], references: [id])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String   @db.Text
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 2.2: Jalankan migration**

```bash
npx prisma migrate dev --name init
```

Expected: folder `prisma/migrations/` dibuat, tabel terbuat di MySQL.

Verifikasi di MySQL:
```bash
"C:/Program Files/FlyEnv-Data/app/mysql-8.4.9/mysql-8.4.9-winx64/bin/mysql.exe" \
  -u root gridkita_cms -e "SHOW TABLES;"
```

Expected: ~18 tabel muncul (User, Portfolio, ServiceCategory, Order, dll).

- [ ] **Step 2.3: Commit**

```bash
git add prisma/
git commit -m "feat(db): add prisma schema - 18 tables from PRD §4.4"
```

---

## Task 3: Prisma Client Singleton + Auth.js Config

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 3.1: Buat Prisma singleton**

Buat `src/lib/db.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 3.2: Buat Auth.js config**

Buat `src/lib/auth.ts`:
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.isActive) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 3.3: Buat Auth.js route handler**

Buat `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3.4: Extend NextAuth types**

Buat `src/types/next-auth.d.ts`:
```typescript
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      email: string;
      name: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
```

- [ ] **Step 3.5: Commit**

```bash
git add src/lib/db.ts src/lib/auth.ts src/app/api/ src/types/next-auth.d.ts
git commit -m "feat(auth): add Auth.js v5 with Credentials + PrismaAdapter"
```

---

## Task 4: Seed Database dari Mock Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (tambah prisma.seed)

- [ ] **Step 4.1: Buat seed script**

Buat `prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Users ---
  const adminPass = await bcrypt.hash("gridkita2026", 12);
  const designerPass = await bcrypt.hash("designer123", 12);
  const clientPass = await bcrypt.hash("client123", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@gridkita.id" },
    update: {},
    create: {
      email: "admin@gridkita.id",
      password: adminPass,
      name: "Firta Aulia",
      role: "ADMIN",
      phone: "081200000001",
      avatarUrl: "https://i.pravatar.cc/120?img=47",
      isActive: true,
    },
  });

  const wahyu = await db.user.upsert({
    where: { email: "wahyu@gridkita.id" },
    update: {},
    create: {
      email: "wahyu@gridkita.id",
      password: designerPass,
      name: "Wahyu Pratama",
      role: "DESIGNER",
      phone: "081200000002",
      bankAccount: "BCA 1234567890 a.n. Wahyu Pratama",
      avatarUrl: "https://i.pravatar.cc/120?img=12",
      isActive: true,
    },
  });

  const raffi = await db.user.upsert({
    where: { email: "raffi@gridkita.id" },
    update: {},
    create: {
      email: "raffi@gridkita.id",
      password: designerPass,
      name: "Raffi Hidayat",
      role: "DESIGNER",
      phone: "081200000003",
      bankAccount: "Mandiri 9876543210 a.n. Raffi Hidayat",
      avatarUrl: "https://i.pravatar.cc/120?img=33",
      isActive: true,
    },
  });

  const nabil = await db.user.upsert({
    where: { email: "nabil@gridkita.id" },
    update: {},
    create: {
      email: "nabil@gridkita.id",
      password: designerPass,
      name: "Nabil Akbar",
      role: "DESIGNER",
      phone: "081200000004",
      bankAccount: "BNI 5556667778 a.n. Nabil Akbar",
      avatarUrl: "https://i.pravatar.cc/120?img=14",
      isActive: false,
    },
  });

  const rifat = await db.user.upsert({
    where: { email: "rifat@example.com" },
    update: {},
    create: {
      email: "rifat@example.com",
      password: clientPass,
      name: "Rifat Setiawan",
      role: "CLIENT",
      phone: "081299999991",
      avatarUrl: "https://i.pravatar.cc/120?img=68",
      isActive: true,
    },
  });

  const amelia = await db.user.upsert({
    where: { email: "amelia@example.com" },
    update: {},
    create: {
      email: "amelia@example.com",
      password: clientPass,
      name: "Amelia Putri",
      role: "CLIENT",
      phone: "081299999992",
      avatarUrl: "https://i.pravatar.cc/120?img=45",
      isActive: true,
    },
  });

  const budi = await db.user.upsert({
    where: { email: "budi@example.com" },
    update: {},
    create: {
      email: "budi@example.com",
      password: clientPass,
      name: "Budi Santoso",
      role: "CLIENT",
      phone: "081299999993",
      avatarUrl: "https://i.pravatar.cc/120?img=52",
      isActive: true,
    },
  });

  // --- Service Categories ---
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

  // --- Service Packages (6 contoh) ---
  await db.servicePackage.upsert({
    where: { slug: "logo-pro" },
    update: {},
    create: {
      categoryId: catBranding.id,
      name: "Logo Pro + Guideline",
      slug: "logo-pro",
      description: "Logo profesional plus brand guideline 8 halaman. Dilengkapi mockup aplikasi logo.",
      features: JSON.stringify(["3 konsep logo", "5x revisi", "File master AI/SVG/PDF", "Brand guideline 8 hal", "Mockup aplikasi"]),
      basePrice: 750000,
      estimatedDays: 7,
      thumbnailPath: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
      isActive: true,
      isPopular: true,
    },
  });

  await db.servicePackage.upsert({
    where: { slug: "logo-basic" },
    update: {},
    create: {
      categoryId: catBranding.id,
      name: "Logo Basic",
      slug: "logo-basic",
      description: "Desain logo sederhana untuk usaha kecil.",
      features: JSON.stringify(["1 konsep logo", "2x revisi minor", "File PNG + JPG"]),
      basePrice: 150000,
      estimatedDays: 3,
      thumbnailPath: "https://images.unsplash.com/photo-1560157368-946d9c8f7cb6?w=800&auto=format&fit=crop",
      isActive: true,
    },
  });

  await db.servicePackage.upsert({
    where: { slug: "feed-instagram-9" },
    update: {},
    create: {
      categoryId: catSocial.id,
      name: "Feed Instagram 9 Slot",
      slug: "feed-instagram-9",
      description: "Desain 9 konten feed Instagram dengan tema serasi.",
      features: JSON.stringify(["9 desain feed", "Konsep tema selaras", "2x revisi per slot", "PNG 1080x1080"]),
      basePrice: 450000,
      estimatedDays: 5,
      thumbnailPath: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop",
      isActive: true,
      isPopular: true,
    },
  });

  await db.servicePackage.upsert({
    where: { slug: "poster-promo-a3" },
    update: {},
    create: {
      categoryId: catPrint.id,
      name: "Poster Promo A3",
      slug: "poster-promo-a3",
      description: "Desain poster promo siap cetak ukuran A3.",
      features: JSON.stringify(["File PDF print-ready", "300 DPI CMYK", "2x revisi"]),
      basePrice: 175000,
      estimatedDays: 2,
      thumbnailPath: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
      isActive: true,
    },
  });

  await db.servicePackage.upsert({
    where: { slug: "banner-ads-set" },
    update: {},
    create: {
      categoryId: catDigital.id,
      name: "Banner Ads Set",
      slug: "banner-ads-set",
      description: "Set 5 banner iklan ukuran umum (FB, IG, GDN).",
      features: JSON.stringify(["5 ukuran banner", "PNG + GIF", "2x revisi"]),
      basePrice: 350000,
      estimatedDays: 4,
      thumbnailPath: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop",
      isActive: true,
    },
  });

  // --- Expense Categories ---
  const ecOp = await db.expenseCategory.create({ data: { name: "Operasional", isOperational: true } }).catch(() =>
    db.expenseCategory.findFirst({ where: { name: "Operasional" } }).then(r => r!)
  );

  const ecSoftware = await db.expenseCategory.create({ data: { name: "Software & Lisensi", isOperational: true } }).catch(() =>
    db.expenseCategory.findFirst({ where: { name: "Software & Lisensi" } }).then(r => r!)
  );

  // --- Recurring Expenses ---
  await db.recurringExpense.upsert({
    where: { id: "re-wifi" },
    update: {},
    create: { id: "re-wifi", categoryId: ecOp!.id, name: "WiFi Indihome", amount: 180000, recurrenceDay: 5, isActive: true },
  });

  await db.recurringExpense.upsert({
    where: { id: "re-adobe" },
    update: {},
    create: { id: "re-adobe", categoryId: ecSoftware!.id, name: "Adobe Creative Cloud", amount: 15000, recurrenceDay: 1, isActive: true },
  });

  console.log("✅ Seed selesai!");
  console.log("Akun demo:");
  console.log("  Admin:    admin@gridkita.id / gridkita2026");
  console.log("  Designer: wahyu@gridkita.id / designer123");
  console.log("  Client:   rifat@example.com / client123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
```

- [ ] **Step 4.2: Tambah prisma.seed ke package.json**

Di `package.json`, tambahkan:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Atau (lebih simpel karena sudah ada tsx):
```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

Install tsx jika belum ada:
```bash
npm install tsx --save-dev
```

- [ ] **Step 4.3: Jalankan seed**

```bash
npx prisma db seed
```

Expected:
```
✅ Seed selesai!
Akun demo:
  Admin:    admin@gridkita.id / gridkita2026
  Designer: wahyu@gridkita.id / designer123
  Client:   rifat@example.com / client123
```

- [ ] **Step 4.4: Verifikasi di MySQL**

```bash
"C:/Program Files/FlyEnv-Data/app/mysql-8.4.9/mysql-8.4.9-winx64/bin/mysql.exe" \
  -u root gridkita_cms -e "SELECT email, role FROM User;"
```

Expected: 7 baris (1 admin, 3 designer, 3 client).

- [ ] **Step 4.5: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat(db): add seed script with demo accounts"
```

---

## Task 5: Query Layer (menggantikan mock/*)

**Files:**
- Create: `src/lib/queries/users.ts`
- Create: `src/lib/queries/catalog.ts`
- Create: `src/lib/queries/portfolio.ts`
- Create: `src/lib/queries/orders.ts`
- Create: `src/lib/queries/finance.ts`
- Create: `src/lib/queries/notifications.ts`
- Create: `src/lib/queries/analytics.ts`

Setiap file mengexport fungsi dengan **signature identik** dengan mock, hanya beda implementasi (Prisma vs hardcoded).

- [ ] **Step 5.1: `src/lib/queries/users.ts`**

```typescript
import { db } from "@/lib/db";
import type { User } from "@/types";

// Helper: konversi Prisma User → domain User
function toUser(u: {
  id: string; email: string; name: string; role: string;
  phone: string | null; bankAccount: string | null; avatarUrl: string | null;
  isActive: boolean; createdAt: Date;
}): User {
  return {
    ...u,
    role: u.role as User["role"],
    phone: u.phone ?? undefined,
    bankAccount: u.bankAccount ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function userById(id: string): Promise<User | undefined> {
  const u = await db.user.findUnique({ where: { id } });
  return u ? toUser(u) : undefined;
}

export async function userByEmail(email: string): Promise<User | undefined> {
  const u = await db.user.findUnique({ where: { email } });
  return u ? toUser(u) : undefined;
}

export async function designers(): Promise<User[]> {
  const list = await db.user.findMany({ where: { role: "DESIGNER" } });
  return list.map(toUser);
}

export async function activeDesigners(): Promise<User[]> {
  const list = await db.user.findMany({ where: { role: "DESIGNER", isActive: true } });
  return list.map(toUser);
}

export async function allUsers(): Promise<User[]> {
  const list = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return list.map(toUser);
}
```

- [ ] **Step 5.2: `src/lib/queries/catalog.ts`**

```typescript
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
```

- [ ] **Step 5.3: `src/lib/queries/portfolio.ts`**

```typescript
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
```

- [ ] **Step 5.4: `src/lib/queries/orders.ts`**

```typescript
import { db } from "@/lib/db";
import type { Order, OrderStatusHistory, Payment, Deliverable } from "@/types";
import type { Prisma } from "@prisma/client";

type PrismaOrder = Prisma.OrderGetPayload<{ include: { attachments: true } }>;

function toOrder(o: PrismaOrder): Order {
  return {
    id: o.id, code: o.code, clientId: o.clientId,
    designerId: o.designerId ?? undefined,
    type: o.type as Order["type"],
    servicePackageId: o.servicePackageId ?? undefined,
    customDescription: o.customDescription ?? undefined,
    quotedPrice: o.quotedPrice ? Number(o.quotedPrice) : undefined,
    finalPrice: Number(o.finalPrice),
    status: o.status as Order["status"],
    revisionCount: o.revisionCount,
    brief: o.briefData as Order["brief"],
    attachments: o.attachments.map((a) => ({
      id: a.id, orderId: a.orderId, url: `/api/files/${a.id}`,
      name: a.name, uploadedById: a.uploadedById,
      kind: a.kind as "BRIEF" | "REFERENCE",
      uploadedAt: a.uploadedAt.toISOString(),
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function ordersByClient(clientId: string): Promise<Order[]> {
  const list = await db.order.findMany({
    where: { clientId },
    include: { attachments: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map(toOrder);
}

export async function ordersByDesigner(designerId: string): Promise<Order[]> {
  const list = await db.order.findMany({
    where: { designerId },
    include: { attachments: true },
    orderBy: { updatedAt: "desc" },
  });
  return list.map(toOrder);
}

export async function orderById(id: string): Promise<Order | undefined> {
  const o = await db.order.findUnique({ where: { id }, include: { attachments: true } });
  return o ? toOrder(o) : undefined;
}

export async function allOrders(): Promise<Order[]> {
  const list = await db.order.findMany({ include: { attachments: true }, orderBy: { updatedAt: "desc" } });
  return list.map(toOrder);
}

export async function historyByOrder(orderId: string): Promise<OrderStatusHistory[]> {
  const list = await db.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { changedAt: "asc" },
  });
  return list.map((h) => ({
    id: h.id, orderId: h.orderId,
    fromStatus: h.fromStatus as OrderStatusHistory["fromStatus"],
    toStatus: h.toStatus as OrderStatusHistory["toStatus"],
    changedById: h.changedById, note: h.note ?? undefined,
    changedAt: h.changedAt.toISOString(),
  }));
}

export async function paymentByOrder(orderId: string): Promise<Payment | undefined> {
  const p = await db.payment.findUnique({ where: { orderId } });
  if (!p) return undefined;
  return {
    id: p.id, orderId: p.orderId, amount: Number(p.amount),
    qrisImageUrl: p.qrisImageUrl,
    proofImageUrl: p.proofPath ? `/api/files/proof-${p.id}` : undefined,
    status: p.status as Payment["status"],
    verifiedById: p.verifiedById ?? undefined,
    verifiedAt: p.verifiedAt?.toISOString(),
    rejectReason: p.rejectReason ?? undefined,
    uploadedAt: p.uploadedAt?.toISOString(),
  };
}

export async function deliverablesByOrder(orderId: string): Promise<Deliverable[]> {
  const list = await db.deliverable.findMany({ where: { orderId } });
  return list.map((d) => ({
    id: d.id, orderId: d.orderId, designerId: d.designerId,
    fileName: d.fileName, url: `/api/files/deliverable-${d.id}`,
    mimeType: d.mimeType, sizeBytes: d.sizeBytes,
    uploadedAt: d.uploadedAt.toISOString(),
  }));
}
```

- [ ] **Step 5.5: `src/lib/queries/finance.ts`**

```typescript
import { db } from "@/lib/db";
import type { PayrollEntry, PayoutBatch, RecurringExpense, CashFlow, ExpenseCategory } from "@/types";

export async function payrollEntries(): Promise<PayrollEntry[]> {
  const list = await db.payrollEntry.findMany({ orderBy: { accruedAt: "desc" } });
  return list.map((e) => ({
    id: e.id, orderId: e.orderId, designerId: e.designerId,
    orderTotal: Number(e.orderTotal),
    commissionAmount: Number(e.commissionAmount),
    companyShare: Number(e.companyShare),
    status: e.status as PayrollEntry["status"],
    accruedAt: e.accruedAt.toISOString(),
    paidOutAt: e.paidOutAt?.toISOString(),
    payoutBatchId: e.payoutBatchId ?? undefined,
  }));
}

export async function payoutBatches(): Promise<PayoutBatch[]> {
  const list = await db.payoutBatch.findMany({
    include: { entries: { select: { id: true } } },
    orderBy: { processedAt: "desc" },
  });
  return list.map((b) => ({
    id: b.id, periodMonth: b.periodMonth, totalAmount: Number(b.totalAmount),
    processedById: b.processedById, processedAt: b.processedAt.toISOString(),
    note: b.note ?? undefined, entryIds: b.entries.map((e) => e.id),
  }));
}

export async function expenseCategories(): Promise<ExpenseCategory[]> {
  return db.expenseCategory.findMany();
}

export async function recurringExpenses(): Promise<RecurringExpense[]> {
  const list = await db.recurringExpense.findMany({ orderBy: { name: "asc" } });
  return list.map((r) => ({
    id: r.id, categoryId: r.categoryId, name: r.name,
    amount: Number(r.amount), recurrenceDay: r.recurrenceDay,
    isActive: r.isActive, lastGeneratedAt: r.lastGeneratedAt?.toISOString(),
  }));
}

export async function cashFlows(): Promise<CashFlow[]> {
  const list = await db.cashFlow.findMany({ orderBy: { occurredAt: "desc" } });
  return list.map((c) => ({
    id: c.id, type: c.type as CashFlow["type"],
    source: c.source as CashFlow["source"],
    categoryId: c.categoryId ?? undefined,
    amount: Number(c.amount), description: c.description,
    occurredAt: c.occurredAt.toISOString(),
    sourceOrderId: c.sourceOrderId ?? undefined,
    sourceRecurringId: c.sourceRecurringId ?? undefined,
    recordedById: c.recordedById,
  }));
}

export async function commissionByDesigner(designerId: string, periodPrefix?: string): Promise<number> {
  const list = await db.payrollEntry.findMany({
    where: periodPrefix
      ? { designerId, accruedAt: { gte: new Date(periodPrefix + "-01") } }
      : { designerId },
  });
  return list.reduce((s, e) => s + Number(e.commissionAmount), 0);
}

export async function payoutsByDesigner(designerId: string): Promise<PayrollEntry[]> {
  const list = await db.payrollEntry.findMany({
    where: { designerId }, orderBy: { accruedAt: "desc" },
  });
  return list.map((e) => ({
    id: e.id, orderId: e.orderId, designerId: e.designerId,
    orderTotal: Number(e.orderTotal), commissionAmount: Number(e.commissionAmount),
    companyShare: Number(e.companyShare), status: e.status as PayrollEntry["status"],
    accruedAt: e.accruedAt.toISOString(), paidOutAt: e.paidOutAt?.toISOString(),
    payoutBatchId: e.payoutBatchId ?? undefined,
  }));
}
```

- [ ] **Step 5.6: `src/lib/queries/notifications.ts`**

```typescript
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
```

- [ ] **Step 5.7: `src/lib/queries/analytics.ts`**

```typescript
import { db } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/state-machine";
import type { OrderStatus } from "@/types";

export async function adminKpis() {
  const [revenue, activeOrders, waitingPayments, accruedPayroll] = await Promise.all([
    db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { finalPrice: true } }),
    db.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
    db.order.count({ where: { status: "WAITING_VERIFICATION" } }),
    db.payrollEntry.aggregate({ where: { status: "ACCRUED" }, _sum: { commissionAmount: true } }),
  ]);
  return {
    revenue: Number(revenue._sum.finalPrice ?? 0),
    activeOrders,
    waitingPayments,
    accruedPayroll: Number(accruedPayroll._sum.commissionAmount ?? 0),
  };
}

export async function monthlyFinance() {
  // Hitung 6 bulan terakhir dari cashflow
  const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun"];
  const year = new Date().getFullYear();
  return Promise.all(
    MONTHS.map(async (month, idx) => {
      const from = new Date(year, idx, 1);
      const to = new Date(year, idx + 1, 0, 23, 59, 59);
      const [inc, exp] = await Promise.all([
        db.cashFlow.aggregate({ where: { type: "INCOME", source: "ORDER_PAYMENT", occurredAt: { gte: from, lte: to } }, _sum: { amount: true } }),
        db.cashFlow.aggregate({ where: { type: "EXPENSE", occurredAt: { gte: from, lte: to } }, _sum: { amount: true } }),
      ]);
      return { month, pemasukan: Number(inc._sum.amount ?? 0), pengeluaran: Number(exp._sum.amount ?? 0) };
    })
  );
}

export async function designerRanking() {
  const designers = await db.user.findMany({ where: { role: "DESIGNER" } });
  return Promise.all(
    designers.map(async (d) => {
      const agg = await db.payrollEntry.aggregate({ where: { designerId: d.id }, _sum: { commissionAmount: true } });
      return { name: d.name.split(" ")[0], komisi: Number(agg._sum.commissionAmount ?? 0) };
    })
  ).then((r) => r.sort((a, b) => b.komisi - a.komisi));
}

export async function orderFunnel() {
  const statuses = Object.keys(STATUS_LABEL) as OrderStatus[];
  return Promise.all(
    statuses.map(async (status) => {
      const jumlah = await db.order.count({ where: { status } });
      return { status: STATUS_LABEL[status], jumlah };
    })
  ).then((r) => r.filter((x) => x.jumlah > 0));
}
```

- [ ] **Step 5.8: Commit**

```bash
git add src/lib/queries/ src/lib/db.ts
git commit -m "feat(queries): add prisma query layer replacing mock data"
```

---

## Task 6: Replace Auth Mock dengan Auth.js Session

**Files:**
- Modify: `src/lib/auth-mock.ts`
- Modify: `src/app/actions/auth.ts`
- Delete: `src/components/role-switcher.tsx` (hapus di production build; bisa pindah ke dev-only)

- [ ] **Step 6.1: Update `src/lib/auth-mock.ts`**

Rename jadi `src/lib/session.ts` (lebih tepat), lalu swap import di seluruh codebase:

```typescript
// src/lib/session.ts
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role, User } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const u = await db.user.findUnique({ where: { id: session.user.id } });
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name,
    role: u.role as Role, phone: u.phone ?? undefined,
    bankAccount: u.bankAccount ?? undefined,
    avatarUrl: u.avatarUrl ?? undefined,
    isActive: u.isActive, createdAt: u.createdAt.toISOString(),
  };
}

export async function requireRole(role: Role | Role[]): Promise<User> {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(u.role)) redirect("/login");
  return u;
}

export function dashboardPathFor(role: Role): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "DESIGNER": return "/designer";
    case "CLIENT": return "/dashboard";
  }
}
```

- [ ] **Step 6.2: Update `src/app/actions/auth.ts`**

```typescript
"use server";

import { signIn as authSignIn, signOut as authSignOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { dashboardPathFor } from "@/lib/session";
import type { Role } from "@/types";

export async function signInWithCredentials(email: string, password: string) {
  await authSignIn("credentials", { email, password, redirectTo: undefined });
  const user = await db.user.findUnique({ where: { email } });
  if (user) redirect(dashboardPathFor(user.role as Role));
}

export async function registerClient(data: {
  name: string; email: string; phone: string; password: string;
}) {
  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) throw new Error("Email sudah terdaftar.");
  const hash = await bcrypt.hash(data.password, 12);
  await db.user.create({
    data: { email: data.email, password: hash, name: data.name, phone: data.phone, role: "CLIENT" },
  });
  await authSignIn("credentials", { email: data.email, password: data.password, redirectTo: "/dashboard" });
}

export async function signOut() {
  await authSignOut({ redirectTo: "/" });
}
```

- [ ] **Step 6.3: Update semua file yang import `auth-mock` → `session`**

Jalankan find-replace:
```bash
# Di terminal:
grep -rn "from.*auth-mock" src/ --include="*.ts" --include="*.tsx" -l
# Lalu ganti setiap:
# import { ... } from "@/lib/auth-mock"  →  import { ... } from "@/lib/session"
```

- [ ] **Step 6.4: Update halaman login agar gunakan server action nyata**

Buka `src/app/(auth)/login/page.tsx`, ubah `loginAction`:
```typescript
async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  await signInWithCredentials(email, password);
}
```

Tombol "Demo login" bisa tetap ada tapi gunakan password seeder (`gridkita2026`, `designer123`, `client123`).

- [ ] **Step 6.5: Update halaman register**

```typescript
async function registerAction(formData: FormData) {
  "use server";
  await registerClient({
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    phone: String(formData.get("phone")),
    password: String(formData.get("password")),
  });
}
```

- [ ] **Step 6.6: Commit**

```bash
git add src/lib/session.ts src/app/actions/auth.ts src/app/(auth)/
git commit -m "feat(auth): replace cookie mock auth with Auth.js v5 session"
```

---

## Task 7: Swap Import Mock → Queries di Semua Pages

**Files:** 44 file (lihat daftar di atas)

**Pola:** Setiap page yang saat ini `import { xxx } from "@/lib/mock/yyy"` diganti jadi `import { xxx } from "@/lib/queries/yyy"`. Karena signatures identik, hanya baris import yang berubah + beberapa `await` ditambah (karena query async, mock sync).

- [ ] **Step 7.1: Swap import di halaman publik**

File target: `(public)/page.tsx`, `(public)/portfolio/page.tsx`, `(public)/portfolio/[id]/page.tsx`, `(public)/katalog/page.tsx`, `(public)/katalog/[slug]/page.tsx`

Pattern contoh untuk `(public)/page.tsx`:
```typescript
// Sebelum:
import { portfolios } from "@/lib/mock/portfolio";
import { packages, categories } from "@/lib/mock/catalog";

// Sesudah:
import { portfolios } from "@/lib/queries/portfolio";
import { packages, categories } from "@/lib/queries/catalog";
```

Dan karena queries async, tambah `await`:
```typescript
// Sebelum:
const featuredPortfolios = portfolios.slice(0, 6);

// Sesudah:
const allPortfolios = await portfolios();
const featuredPortfolios = allPortfolios.slice(0, 6);
```

- [ ] **Step 7.2: Swap import di dashboard/orders**

File target: `dashboard/page.tsx`, `dashboard/orders/page.tsx`, `dashboard/orders/new/page.tsx`, `dashboard/orders/new/brief/page.tsx`, `dashboard/orders/[id]/page.tsx`, `dashboard/notifications/page.tsx`, `dashboard/profile/page.tsx`, `dashboard/layout.tsx`

Tambah `await` di semua pemanggilan query karena mereka async.

- [ ] **Step 7.3: Swap import di designer/**

File target: `designer/page.tsx`, `designer/tasks/page.tsx`, `designer/tasks/[id]/page.tsx`, `designer/earnings/page.tsx`, `designer/notifications/page.tsx`, `designer/profile/page.tsx`, `designer/layout.tsx`

- [ ] **Step 7.4: Swap import di admin/**

File target: semua 16 file admin. Perhatikan `admin/page.tsx` mengimport dari `analytics.ts` — gunakan `@/lib/queries/analytics`.

- [ ] **Step 7.5: Swap import di components/**

File target: `components/order-timeline.tsx`, `components/public-nav.tsx`, `components/role-switcher.tsx`

- [ ] **Step 7.6: Jalankan TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7.7: Commit**

```bash
git add src/
git commit -m "feat: swap all mock imports to async prisma query layer"
```

---

## Task 8: Server Actions Nyata (Mutasi DB)

**Files:**
- Create: `src/app/actions/orders.ts`
- Create: `src/app/actions/payments.ts`
- Create: `src/app/actions/admin.ts`
- Create: `src/app/actions/designer.ts`
- Create: `src/app/actions/cms.ts`
- Create: `src/app/actions/cashflow.ts`

- [ ] **Step 8.1: `src/app/actions/orders.ts`**

```typescript
"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { calculateSplit } from "@/lib/payroll";
import { revalidatePath } from "next/cache";

// Helper: generate order code GK-YYYY-NNNN
async function generateCode(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.order.count({ where: { code: { startsWith: `GK-${year}-` } } });
  return `GK-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function createPackageOrder(packageId: string, briefData: Record<string, string>) {
  const me = await requireRole("CLIENT");
  const pkg = await db.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) throw new Error("Paket tidak ditemukan.");

  const order = await db.order.create({
    data: {
      code: await generateCode(),
      clientId: me.id,
      type: "PACKAGE",
      servicePackageId: packageId,
      finalPrice: pkg.basePrice,
      status: "PENDING_PAYMENT",
      briefData,
    },
  });

  // Create initial payment record
  await db.payment.create({
    data: { orderId: order.id, amount: pkg.basePrice, qrisImageUrl: "/qris-sample.svg" },
  });

  // Status history
  await db.orderStatusHistory.create({
    data: { orderId: order.id, toStatus: "PENDING_PAYMENT", changedById: me.id },
  });

  // Notify admin
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    await db.notification.create({
      data: {
        userId: admin.id, type: "ORDER_NEW",
        title: "Order baru masuk",
        message: `Order ${order.code} dari ${me.name} telah masuk.`,
        link: `/admin/orders/${order.id}`,
      },
    });
  }

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}

export async function createCustomOrder(description: string, briefData: Record<string, string>) {
  const me = await requireRole("CLIENT");
  const order = await db.order.create({
    data: {
      code: await generateCode(),
      clientId: me.id,
      type: "CUSTOM",
      customDescription: description,
      finalPrice: 0,
      status: "QUOTE_REQUESTED",
      briefData,
    },
  });
  await db.orderStatusHistory.create({
    data: { orderId: order.id, toStatus: "QUOTE_REQUESTED", changedById: me.id },
  });
  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/orders/${order.id}`);
}

export async function cancelOrder(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (!canTransition(order.status as never, "CANCELLED", me.role as never))
    throw new Error("Tidak dapat membatalkan pada status ini.");

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: "CANCELLED", changedById: me.id } }),
  ]);
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function requestRevision(orderId: string, note: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "REVISION", revisionCount: { increment: 1 } } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status, toStatus: "REVISION", changedById: me.id, note } }),
  ]);

  // Notify designer
  if (order.designerId) {
    await db.notification.create({
      data: {
        userId: order.designerId, type: "ORDER_REVISION",
        title: "Klien meminta revisi",
        message: `Order ${order.code} mendapat permintaan revisi #${order.revisionCount + 1}.`,
        link: `/designer/tasks/${orderId}`,
      },
    });
  }
  revalidatePath(`/dashboard/orders/${orderId}`);
}

export async function confirmDelivered(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "DONE") throw new Error("Order belum DONE.");

  const split = calculateSplit(Number(order.finalPrice));

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "DELIVERED" } });
    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: "DONE", toStatus: "DELIVERED", changedById: me.id },
    });
    // Payroll entry (UNIQUE orderId — idempoten)
    await tx.payrollEntry.upsert({
      where: { orderId },
      update: {},
      create: {
        orderId, designerId: order.designerId!,
        orderTotal: order.finalPrice,
        commissionAmount: split.designerShare,
        companyShare: split.companyShare,
        status: "ACCRUED",
      },
    });
    // CashFlow company share
    await tx.cashFlow.create({
      data: {
        type: "INCOME", source: "COMMISSION_SHARE",
        amount: split.companyShare,
        description: `Bagian perusahaan 30% - ${order.code}`,
        sourceOrderId: orderId,
        recordedById: me.id,
      },
    });
  });

  revalidatePath(`/dashboard/orders/${orderId}`);
}
```

- [ ] **Step 8.2: `src/app/actions/payments.ts`**

```typescript
"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

const STORAGE_DIR = join(process.cwd(), "storage", "payment-proofs");

export async function uploadPaymentProof(formData: FormData) {
  const me = await requireRole("CLIENT");
  const orderId = String(formData.get("orderId"));
  const file = formData.get("proof") as File;
  if (!file || file.size === 0) throw new Error("File tidak ada.");
  if (file.size > 5 * 1024 * 1024) throw new Error("File maksimal 5MB.");

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "PENDING_PAYMENT") throw new Error("Order bukan status PENDING_PAYMENT.");

  await mkdir(STORAGE_DIR, { recursive: true });
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(STORAGE_DIR, filename), buffer);

  await db.$transaction([
    db.payment.update({
      where: { orderId },
      data: { proofPath: `payment-proofs/${filename}`, status: "WAITING", uploadedAt: new Date() },
    }),
    db.order.update({ where: { id: orderId }, data: { status: "WAITING_VERIFICATION" } }),
    db.orderStatusHistory.create({
      data: { orderId, fromStatus: "PENDING_PAYMENT", toStatus: "WAITING_VERIFICATION", changedById: me.id, note: "Bukti pembayaran diunggah" },
    }),
  ]);

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/admin/payments");
}

export async function approvePayment(orderId: string) {
  const me = await requireRole("ADMIN");
  await db.$transaction([
    db.payment.update({ where: { orderId }, data: { status: "APPROVED", verifiedById: me.id, verifiedAt: new Date() } }),
    db.order.update({ where: { id: orderId }, data: { status: "PAID" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "WAITING_VERIFICATION", toStatus: "PAID", changedById: me.id, note: "Pembayaran diverifikasi" } }),
  ]);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (order) {
    await db.notification.create({
      data: {
        userId: order.clientId, type: "PAYMENT_VERIFIED",
        title: "Pembayaran terverifikasi",
        message: `Pembayaran untuk order ${order.code} telah disetujui.`,
        link: `/dashboard/orders/${orderId}`,
      },
    });
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
}

export async function rejectPayment(orderId: string, reason: string) {
  const me = await requireRole("ADMIN");
  await db.$transaction([
    db.payment.update({ where: { orderId }, data: { status: "REJECTED", rejectReason: reason } }),
    db.order.update({ where: { id: orderId }, data: { status: "PENDING_PAYMENT" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "WAITING_VERIFICATION", toStatus: "PENDING_PAYMENT", changedById: me.id, note: `Ditolak: ${reason}` } }),
  ]);
  revalidatePath("/admin/payments");
}
```

- [ ] **Step 8.3: `src/app/actions/admin.ts`**

```typescript
"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function assignOrder(orderId: string, designerId: string) {
  const me = await requireRole("ADMIN");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");

  const fromStatus = order.status;
  const toStatus = order.status === "PAID" ? "ASSIGNED" : order.status; // reassign

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { designerId, status: toStatus } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus, toStatus, changedById: me.id, note: `Ditugaskan ke desainer` } }),
  ]);

  await db.notification.create({
    data: {
      userId: designerId, type: "ORDER_ASSIGNED",
      title: "Order baru ditugaskan",
      message: `Anda mendapat order ${order.code}.`,
      link: `/designer/tasks/${orderId}`,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function sendQuote(orderId: string, price: number, days: number, note: string) {
  const me = await requireRole("ADMIN");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan.");

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { quotedPrice: price, finalPrice: price, status: "QUOTE_OFFERED" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "QUOTE_REQUESTED", toStatus: "QUOTE_OFFERED", changedById: me.id, note: `Quote: Rp${price} / ${days} hari. ${note}` } }),
  ]);

  await db.notification.create({
    data: {
      userId: order.clientId, type: "QUOTE_OFFERED",
      title: "Penawaran dari GridKita",
      message: `Admin telah mengirim penawaran harga untuk order ${order.code}.`,
      link: `/dashboard/orders/${orderId}`,
    },
  });

  revalidatePath("/admin/quotes");
}

export async function processPayrollBatch(designerIds: string[], periodMonth: string) {
  const me = await requireRole("ADMIN");
  const entries = await db.payrollEntry.findMany({
    where: { designerId: { in: designerIds }, status: "ACCRUED" },
  });
  if (!entries.length) throw new Error("Tidak ada entri accrued.");

  const total = entries.reduce((s, e) => s + Number(e.commissionAmount), 0);
  await db.$transaction([
    db.payoutBatch.create({
      data: {
        periodMonth, totalAmount: total, processedById: me.id,
        entries: { connect: entries.map((e) => ({ id: e.id })) },
      },
    }),
    db.payrollEntry.updateMany({
      where: { id: { in: entries.map((e) => e.id) } },
      data: { status: "PAID_OUT", paidOutAt: new Date() },
    }),
  ]);

  revalidatePath("/admin/payroll");
  redirect("/admin/payroll");
}

export async function acceptQuote(orderId: string) {
  const me = await requireRole("CLIENT");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== me.id) throw new Error("Tidak ditemukan.");
  if (order.status !== "QUOTE_OFFERED") throw new Error("Order bukan status QUOTE_OFFERED.");

  // Buat payment record dulu
  await db.$transaction([
    db.payment.upsert({
      where: { orderId },
      update: {},
      create: { orderId, amount: order.finalPrice, qrisImageUrl: "/qris-sample.svg" },
    }),
    db.order.update({ where: { id: orderId }, data: { status: "PENDING_PAYMENT" } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: "QUOTE_OFFERED", toStatus: "PENDING_PAYMENT", changedById: me.id, note: "Klien menyetujui quote" } }),
  ]);

  revalidatePath(`/dashboard/orders/${orderId}`);
}
```

- [ ] **Step 8.4: `src/app/actions/designer.ts`**

```typescript
"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { canTransition } from "@/lib/state-machine";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

const DELIVERABLE_DIR = join(process.cwd(), "storage", "deliverables");

export async function updateOrderStatus(orderId: string, toStatus: OrderStatus, note?: string) {
  const me = await requireRole("DESIGNER");
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.designerId !== me.id) throw new Error("Tidak ditemukan.");
  if (!canTransition(order.status as OrderStatus, toStatus, "DESIGNER"))
    throw new Error(`Tidak dapat transisi ${order.status} → ${toStatus}.`);

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: toStatus } }),
    db.orderStatusHistory.create({ data: { orderId, fromStatus: order.status as OrderStatus, toStatus, changedById: me.id, note } }),
  ]);

  revalidatePath(`/designer/tasks/${orderId}`);
}

export async function uploadDeliverable(formData: FormData) {
  const me = await requireRole("DESIGNER");
  const orderId = String(formData.get("orderId"));
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("File tidak ada.");

  await mkdir(DELIVERABLE_DIR, { recursive: true });
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(join(DELIVERABLE_DIR, filename), Buffer.from(await file.arrayBuffer()));

  await db.deliverable.create({
    data: {
      orderId, designerId: me.id,
      path: `deliverables/${filename}`,
      fileName: file.name, mimeType: file.type, sizeBytes: file.size,
    },
  });

  revalidatePath(`/designer/tasks/${orderId}`);
}
```

- [ ] **Step 8.5: `src/app/actions/cms.ts` (ringkas)**

```typescript
"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDesigner(data: {
  name: string; email: string; password: string; bankAccount?: string;
}) {
  await requireRole("ADMIN");
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash(data.password, 12);
  await db.user.create({
    data: { name: data.name, email: data.email, password: hash, role: "DESIGNER", bankAccount: data.bankAccount },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function toggleUserActive(userId: string) {
  await requireRole("ADMIN");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User tidak ditemukan.");
  await db.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/users");
}

export async function deletePortfolio(portfolioId: string) {
  await requireRole("ADMIN");
  await db.portfolio.delete({ where: { id: portfolioId } });
  revalidatePath("/admin/portfolio");
}

export async function togglePackageActive(packageId: string) {
  await requireRole("ADMIN");
  const pkg = await db.servicePackage.findUnique({ where: { id: packageId } });
  if (!pkg) throw new Error("Paket tidak ditemukan.");
  await db.servicePackage.update({ where: { id: packageId }, data: { isActive: !pkg.isActive } });
  revalidatePath("/admin/catalog");
}
```

- [ ] **Step 8.6: `src/app/actions/cashflow.ts`**

```typescript
"use server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function addManualCashFlow(data: {
  type: "INCOME" | "EXPENSE";
  categoryId?: string;
  amount: number;
  description: string;
  occurredAt: string;
}) {
  const me = await requireRole("ADMIN");
  await db.cashFlow.create({
    data: { ...data, source: "MANUAL", recordedById: me.id, occurredAt: new Date(data.occurredAt) },
  });
  revalidatePath("/admin/cashflow");
  revalidatePath("/admin/reports");
}

export async function toggleRecurring(id: string) {
  await requireRole("ADMIN");
  const r = await db.recurringExpense.findUnique({ where: { id } });
  if (!r) throw new Error("Tidak ditemukan.");
  await db.recurringExpense.update({ where: { id }, data: { isActive: !r.isActive } });
  revalidatePath("/admin/recurring");
}

export async function syncRecurringExpenses() {
  // Idempoten: panggil saat admin buka dashboard
  const today = new Date();
  const periodMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return;

  const actives = await db.recurringExpense.findMany({ where: { isActive: true } });
  for (const r of actives) {
    if (today.getDate() < r.recurrenceDay) continue;
    if (r.lastGeneratedAt) {
      const lastMonth = r.lastGeneratedAt.toISOString().slice(0, 7);
      if (lastMonth >= periodMonth) continue; // sudah generate bulan ini
    }
    await db.$transaction([
      db.cashFlow.create({
        data: {
          type: "EXPENSE", source: "RECURRING_EXPENSE",
          categoryId: r.categoryId, amount: r.amount,
          description: `${r.name} - ${periodMonth}`,
          sourceRecurringId: r.id, recordedById: admin.id,
        },
      }),
      db.recurringExpense.update({ where: { id: r.id }, data: { lastGeneratedAt: new Date() } }),
    ]);
  }
}
```

- [ ] **Step 8.7: Wire actions ke form di pages**

Contoh untuk `admin/payments/page.tsx` — ganti `noopAction` dengan:
```typescript
import { approvePayment, rejectPayment } from "@/app/actions/payments";
// ...
<form action={approvePayment.bind(null, p.orderId)}>
  <Button type="submit"><Check className="size-4 mr-1" /> Approve</Button>
</form>
```

Lakukan untuk semua page yang masih pakai `noopAction`.

- [ ] **Step 8.8: Commit**

```bash
git add src/app/actions/
git commit -m "feat(actions): implement real server actions with prisma mutations"
```

---

## Task 9: Private File Serving API

**Files:**
- Create: `src/app/api/files/[id]/route.ts`
- Create: `storage/.gitkeep`

- [ ] **Step 9.1: Buat route handler**

```typescript
// src/app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const STORAGE = join(process.cwd(), "storage");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  // id format: "proof-{paymentId}" | "deliverable-{deliverableId}" | plain attachment id

  let filePath: string | null = null;
  let mimeType = "application/octet-stream";

  if (id.startsWith("proof-")) {
    const paymentId = id.replace("proof-", "");
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment?.proofPath) return new NextResponse("Not Found", { status: 404 });
    // Check ownership: only order client or admin
    const order = await db.order.findUnique({ where: { id: payment.orderId } });
    if (session.user.role !== "ADMIN" && order?.clientId !== session.user.id)
      return new NextResponse("Forbidden", { status: 403 });
    filePath = payment.proofPath;
    mimeType = "image/jpeg";

  } else if (id.startsWith("deliverable-")) {
    const dId = id.replace("deliverable-", "");
    const d = await db.deliverable.findUnique({ where: { id: dId } });
    if (!d) return new NextResponse("Not Found", { status: 404 });
    const order = await db.order.findUnique({ where: { id: d.orderId } });
    if (
      session.user.role !== "ADMIN" &&
      order?.clientId !== session.user.id &&
      d.designerId !== session.user.id
    ) return new NextResponse("Forbidden", { status: 403 });
    filePath = d.path;
    mimeType = d.mimeType;

  } else {
    // Brief attachment
    const att = await db.orderAttachment.findUnique({ where: { id } });
    if (!att) return new NextResponse("Not Found", { status: 404 });
    const order = await db.order.findUnique({ where: { id: att.orderId } });
    if (
      session.user.role !== "ADMIN" &&
      order?.clientId !== session.user.id &&
      order?.designerId !== session.user.id
    ) return new NextResponse("Forbidden", { status: 403 });
    filePath = att.path;
  }

  try {
    const file = await readFile(join(STORAGE, filePath));
    return new NextResponse(file, { headers: { "Content-Type": mimeType } });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
```

- [ ] **Step 9.2: Buat storage directory**

```bash
mkdir -p storage/payment-proofs storage/briefs storage/deliverables
echo ".gitkeep" > storage/.gitkeep
```

Tambah ke `.gitignore`:
```
storage/payment-proofs/
storage/briefs/
storage/deliverables/
```

- [ ] **Step 9.3: Commit**

```bash
git add src/app/api/files/ storage/.gitkeep .gitignore
git commit -m "feat(api): add private file serving route with auth + ownership check"
```

---

## Task 10: Cleanup & Proxy (RBAC Route Guard)

**Files:**
- Create: `src/proxy.ts` (Next 16 menggantikan `middleware.ts`)
- Delete: `src/lib/mock/` (atau pindah ke `src/lib/mock-dev/` kalau mau tetap ada untuk dev)
- Delete: `src/components/role-switcher.tsx`

- [ ] **Step 10.1: Buat `src/proxy.ts`**

```typescript
// Next.js 16: file ini menggantikan middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const role = req.auth?.user?.role;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && role !== "ADMIN")
    return NextResponse.redirect(new URL("/login", req.url));
  if (path.startsWith("/designer") && role !== "DESIGNER")
    return NextResponse.redirect(new URL("/login", req.url));
  if (path.startsWith("/dashboard") && role !== "CLIENT")
    return NextResponse.redirect(new URL("/login", req.url));
});

export const config = {
  matcher: ["/admin/:path*", "/designer/:path*", "/dashboard/:path*"],
};
```

- [ ] **Step 10.2: Hapus mock files**

```bash
rm -rf src/lib/mock/
```

Jika masih ada tests yang butuh mock, bisa tetap simpan sebagai `src/lib/mock-seed/` untuk referensi.

- [ ] **Step 10.3: Final TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 10.4: Final build**

```bash
npm run build
```

Expected: 37 routes, 0 errors.

- [ ] **Step 10.5: Commit final**

```bash
git add -A
git commit -m "feat: complete migration from mock data to MySQL + Auth.js v5"
```

---

## Ringkasan Perubahan

| Before | After |
|---|---|
| `src/lib/mock/*.ts` — hardcoded arrays | `src/lib/queries/*.ts` — async Prisma queries |
| Cookie `gk_user_id` untuk auth | Auth.js v5 JWT session |
| `noopAction()` untuk semua forms | Server Actions nyata mutasi DB |
| Role-switcher floating button | Login form nyata dengan bcrypt |
| Tidak ada file upload nyata | `storage/` private + `/api/files/[id]` |
| Tidak ada RBAC enforcement nyata | `src/proxy.ts` + `requireRole()` dari session |

---

## Akun Demo Setelah Seed

| Role | Email | Password |
|---|---|---|
| Admin | admin@gridkita.id | gridkita2026 |
| Designer | wahyu@gridkita.id | designer123 |
| Client | rifat@example.com | client123 |
