# GridKita CMS

**GridKita CMS** adalah aplikasi manajemen jasa desain grafis berbasis web. Sistem ini mengelola alur pemesanan desain mulai dari katalog paket, pemesanan oleh klien, penugasan desainer, hingga pengiriman hasil — lengkap dengan verifikasi pembayaran, payroll desainer, dan pelaporan keuangan.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Panduan Instalasi Dependencies](#panduan-instalasi-dependencies)
  - [1. Node.js](#1-nodejs)
  - [2. MySQL 8.4](#2-mysql-84)
  - [3. Git](#3-git)
- [Setup Project Lokal](#setup-project-lokal)
- [Environment Variables](#environment-variables)
- [Akun Demo](#akun-demo)
- [Struktur Route](#struktur-route)
- [Perintah Development](#perintah-development)
- [Struktur Folder](#struktur-folder)

---

## Tech Stack

| Teknologi | Versi | Keterangan |
|---|---|---|
| Next.js | 16.2.6 | Framework React full-stack (App Router) |
| React | 19.2.4 | Library UI |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS (oklch color space) |
| Prisma | 6.x | ORM untuk MySQL |
| MySQL | 8.4 | Database relasional |
| Auth.js (next-auth) | v5 beta | Autentikasi JWT + Credentials Provider |
| shadcn/ui (Radix) | 4.7+ | Komponen UI (variant Radix, mendukung `asChild`) |
| Recharts | 3.x | Library chart/grafik |
| Zod | 4.x | Validasi schema |
| React Hook Form | 7.x | Form handling |

---

## Prasyarat

Pastikan perangkat Anda sudah memenuhi kebutuhan berikut sebelum menjalankan project:

| Prasyarat | Versi Minimum | Cek Versi |
|---|---|---|
| **Node.js** | 18.x atau lebih baru | `node -v` |
| **npm** | 9.x (terinstal bersama Node.js) | `npm -v` |
| **MySQL** | 8.4 | `mysql --version` |
| **Git** | 2.x | `git --version` |

> Jika salah satu belum terinstal, ikuti panduan instalasi di bawah.

---

## Panduan Instalasi Dependencies

### 1. Node.js

Node.js diperlukan untuk menjalankan Next.js dan mengelola package npm.

**Langkah instalasi:**

1. Buka halaman download Node.js: [https://nodejs.org](https://nodejs.org)
2. Download versi **LTS** (Long Term Support) — direkomendasikan untuk stabilitas
3. Jalankan installer yang telah didownload
4. Saat instalasi, pastikan opsi berikut **terceklis**:
   - `Node.js runtime`
   - `npm package manager`
   - `Add to PATH` (opsional tapi sangat disarankan)
5. Setelah instalasi selesai, buka terminal baru dan verifikasi:

```bash
node -v
# Contoh output: v20.19.0

npm -v
# Contoh output: 10.9.2
```

> **Troubleshooting:** Jika perintah `node` tidak dikenali setelah instalasi, tutup dan buka ulang terminal Anda. Jika masih tidak dikenali, pastikan Node.js sudah ditambahkan ke PATH environment variable sistem Anda.

### 2. MySQL 8.4

Project ini membutuhkan MySQL 8.4 sebagai database. Anda dapat menggunakan salah satu cara berikut:

#### Opsi A: FlyEnv (Windows)

FlyEnv adalah tool manajemen lingkungan pengembangan untuk Windows.

1. Download FlyEnv dari situs resminya
2. Install dan buka aplikasi FlyEnv
3. Pada tab MySQL, pilih versi **8.4** lalu klik **Start**
4. Pastikan MySQL berjalan di port **3306**
5. Verifikasi koneksi:

```bash
mysql -u root -p -e "SELECT VERSION();"
# Output yang diharapkan: 8.4.x
```

#### Opsi B: XAMPP

1. Download XAMPP dari [https://www.apachefriends.org](https://www.apachefriends.org)
2. Install dan buka XAMPP Control Panel
3. Klik **Start** pada baris **MySQL**
4. Pastikan MySQL berjalan di port **3306**
5. Verifikasi versi MySQL melalui Shell XAMPP atau terminal:

```bash
mysql -u root -e "SELECT VERSION();"
```

> **Catatan:** XAMPP biasanya menyertakan MySQL/MariaDB. Pastikan versi yang tersedia kompatibel. Jika XAMPP menggunakan MariaDB, sebagian besar fitur tetap berjalan normal.

##### Troubleshooting: XAMPP dengan MySQL/MariaDB Versi di Bawah 8.4

Banyak versi XAMPP (terutama versi lama) menyertakan MySQL 5.7 atau MariaDB 10.x yang **versinya di bawah 8.4**. Hal ini dapat menyebabkan masalah karena Prisma 6 dan schema project ini membutuhkan fitur yang hanya tersedia di MySQL 8.0+. Berikut langkah-langkah untuk mengatasinya:

**Masalah yang mungkin terjadi:**

| Masalah | Penyebab |
|---|---|
| `prisma migrate dev` gagal dengan error syntax SQL | MySQL 5.7 tidak mendukung fitur tertentu (misalnya `DEFAULT` pada kolom `JSON`, window functions) |
| Error `COLLATION utf8mb4_0900_ai_ci` tidak dikenali | Collation ini hanya ada di MySQL 8.0+ |
| Error `PrismaClientInitializationError` saat koneksi | Prisma 6 memerlukan MySQL 5.6.2+ minimum, tapi beberapa fitur schema butuh 8.0+ |
| MariaDB terdeteksi sebagai MySQL versi rendah | XAMPP sering menyertakan MariaDB, bukan MySQL asli |

**Langkah 1: Cek versi yang terinstal**

Buka XAMPP Shell atau terminal, lalu jalankan:

```bash
mysql -u root -e "SELECT VERSION();"
```

Jika output menunjukkan versi di bawah 8.0 (misalnya `5.7.x` atau `10.x.x-MariaDB`), lanjutkan ke Langkah 2.

**Langkah 2: Pilih solusi**

Ada beberapa opsi untuk mengatasi versi MySQL yang terlalu rendah:

**Opsi 2A — Upgrade XAMPP ke versi terbaru (termudah)**

XAMPP versi terbaru (8.2+) sudah menyertakan MySQL 8.0+:

1. Download XAMPP versi terbaru dari [https://www.apachefriends.org](https://www.apachefriends.org)
2. Backup database lama jika ada (export via phpMyAdmin)
3. Install XAMPP versi baru di folder berbeda atau replace instalasi lama
4. Jalankan MySQL dari XAMPP Control Panel versi baru
5. Verifikasi versi sudah 8.0+

**Opsi 2B — Ganti MySQL di XAMPP dengan MySQL 8.4 secara manual**

Jika ingin tetap menggunakan instalasi XAMPP yang ada:

1. Download MySQL 8.4 (ZIP/no-installer) dari [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Hentikan MySQL dari XAMPP Control Panel
3. Rename folder `mysql` di direktori XAMPP (misalnya menjadi `mysql_old`) sebagai backup
4. Extract MySQL 8.4 yang sudah didownload ke folder XAMPP dan rename menjadi `mysql`
5. Salin file `my.ini` dari folder `mysql_old` ke folder `mysql` baru, lalu sesuaikan path di dalamnya agar mengarah ke folder baru
6. Jalankan MySQL dari XAMPP Control Panel
7. Verifikasi versi:

```bash
mysql -u root -e "SELECT VERSION();"
# Output yang diharapkan: 8.4.x
```

**Opsi 2C — Gunakan MySQL terpisah di port berbeda (tanpa mengubah XAMPP)**

Jika ingin tetap mempertahankan XAMPP untuk project lain:

1. Install MySQL 8.4 secara standalone (lihat [Opsi C](#opsi-c-mysql-standalone))
2. Konfigurasi MySQL 8.4 agar berjalan di port yang **berbeda** dari XAMPP (misalnya port **3307**)
3. Sesuaikan `DATABASE_URL` di file `.env.local`:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3307/gridkita_cms"
```

4. Pastikan hanya salah satu MySQL yang berjalan saat menjalankan project ini

**Langkah 3: Verifikasi koneksi Prisma**

Setelah melakukan upgrade atau perubahan, pastikan Prisma dapat terhubung ke database:

```bash
npx prisma db pull --print
```

Jika perintah ini berhasil tanpa error, berarti koneksi sudah benar dan versi MySQL sudah kompatibel.

**Langkah 4: Jalankan migrasi ulang**

Jika sebelumnya migrasi gagal karena versi MySQL yang salah, reset dan jalankan ulang:

```bash
npx prisma migrate reset
```

Perintah ini akan menghapus database, membuat ulang semua tabel, dan menjalankan seed data.

#### Opsi C: MySQL Standalone

1. Download MySQL Community Server dari [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Pilih versi **8.4.x** untuk sistem operasi Anda
3. Jalankan installer dan ikuti wizard:
   - Pilih **Server Only** atau **Developer Default**
   - Set password untuk user `root` (atau biarkan kosong untuk development lokal)
   - Pastikan MySQL berjalan sebagai service Windows
4. Verifikasi koneksi:

```bash
mysql -u root -p -e "SELECT VERSION();"
```

#### Membuat Database

Setelah MySQL berjalan, buat database yang dibutuhkan oleh project:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gridkita_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Jika MySQL Anda tidak menggunakan password (default pada beberapa instalasi lokal), hilangkan flag `-p`:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gridkita_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Git

Git diperlukan untuk meng-clone repository project.

**Langkah instalasi:**

1. Download Git dari [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Jalankan installer dengan pengaturan default
3. Verifikasi instalasi:

```bash
git --version
# Contoh output: git version 2.47.0
```

---

## Setup Project Lokal

Ikuti langkah-langkah berikut untuk menjalankan project di lingkungan lokal Anda:

### Langkah 1: Clone Repository

```bash
git clone <URL_REPOSITORY>
cd gridkita-cms
```

### Langkah 2: Install Dependencies

```bash
npm install
```

Perintah ini akan menginstal semua package yang tercantum di `package.json`, termasuk Next.js, Prisma, Auth.js, shadcn/ui, dan lainnya.

### Langkah 3: Buat File Environment

Buat file `.env.local` di root folder project (`gridkita-cms/.env.local`):

```env
# MySQL 8.4 — sesuaikan user, password, host, dan port dengan konfigurasi MySQL Anda
DATABASE_URL="mysql://root:@127.0.0.1:3306/gridkita_cms"

# Auth.js secret — generate string acak 32-byte hex
# Jalankan perintah berikut untuk generate:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Lalu paste hasilnya di bawah ini:
AUTH_SECRET="GANTI_DENGAN_HASIL_RANDOM_HEX_ANDA"

# Base URL untuk Auth.js
NEXTAUTH_URL="http://localhost:3000"
```

> **Penting:**
> - Jika MySQL Anda menggunakan password, format `DATABASE_URL` menjadi: `mysql://root:PASSWORD_ANDA@127.0.0.1:3306/gridkita_cms`
> - Jangan gunakan `AUTH_SECRET` contoh di atas di production. Selalu generate string acak baru.
> - File `.env.local` sudah masuk `.gitignore` sehingga tidak akan ter-commit ke repository.

### Langkah 4: Pastikan MySQL Berjalan & Database Sudah Dibuat

Jika belum membuat database, jalankan:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gridkita_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Langkah 5: Jalankan Migrasi Database

```bash
npx prisma migrate dev
```

Perintah ini akan:
- Membuat semua tabel sesuai `prisma/schema.prisma`
- Menjalankan file migrasi di `prisma/migrations/`
- Meng-generate Prisma Client

### Langkah 6: Seed Data Demo

```bash
npx prisma db seed
```

Perintah ini menjalankan `prisma/seed.ts` yang akan mengisi database dengan data contoh, termasuk akun user, katalog paket, portfolio, dan data order. Lihat daftar akun demo di [bagian Akun Demo](#akun-demo).

### Langkah 7: Jalankan Development Server

```bash
npm run dev
```

Server development akan berjalan di **http://localhost:3000**. Buka URL tersebut di browser.

---

## Environment Variables

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | Connection string MySQL. Format: `mysql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `AUTH_SECRET` | Ya | Secret key untuk JWT session Auth.js. Generate dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Ya | Base URL aplikasi. Untuk development lokal: `http://localhost:3000` |

---

## Akun Demo

Setelah menjalankan `npx prisma db seed`, akun-akun berikut tersedia untuk testing:

| Email | Password | Role | Nama | Keterangan |
|---|---|---|---|---|
| `admin@gridkita.id` | `gridkita2026` | ADMIN | Damar Prakoso | Akses penuh ke semua fitur admin |
| `arka@gridkita.id` | `designer123` | DESIGNER | Arka Mahendra | Desainer aktif |
| `nara@gridkita.id` | `designer123` | DESIGNER | Nara Satria | Desainer aktif |
| `bagas@gridkita.id` | `designer123` | DESIGNER | Bagas Wiratama | Desainer **nonaktif** (`isActive: false`) |
| `tara@example.com` | `client123` | CLIENT | Tara Kusuma | Klien |
| `nesya@example.com` | `client123` | CLIENT | Nesya Larasati | Klien |
| `gilang@example.com` | `client123` | CLIENT | Gilang Aditya | Klien |

> Akun dengan status nonaktif (seperti Bagas) tidak dapat login karena validasi `isActive` di Auth.js.

---

## Struktur Route

Aplikasi memiliki 4 kelompok route berdasarkan akses:

### Publik (tanpa login)

| Route | Halaman |
|---|---|
| `/` | Landing page |
| `/about` | Tentang GridKita |
| `/katalog` | Daftar paket desain |
| `/katalog/[slug]` | Detail paket desain |
| `/portfolio` | Galeri karya |
| `/portfolio/[id]` | Detail karya |
| `/login` | Halaman login |
| `/register` | Halaman registrasi |

### CLIENT (role: CLIENT)

| Route | Halaman |
|---|---|
| `/dashboard` | Dashboard utama klien |
| `/dashboard/orders` | Daftar pesanan |
| `/dashboard/orders/new` | Buat pesanan baru |
| `/dashboard/orders/new/brief` | Isi brief desain |
| `/dashboard/orders/[id]` | Detail pesanan |
| `/dashboard/notifications` | Notifikasi |
| `/dashboard/profile` | Profil klien |

### DESIGNER (role: DESIGNER)

| Route | Halaman |
|---|---|
| `/designer` | Dashboard utama desainer |
| `/designer/tasks` | Daftar tugas |
| `/designer/tasks/[id]` | Detail tugas |
| `/designer/earnings` | Pendapatan / payroll |
| `/designer/notifications` | Notifikasi |
| `/designer/profile` | Profil desainer |

### ADMIN (role: ADMIN)

| Route | Halaman |
|---|---|
| `/admin` | Dashboard utama admin |
| `/admin/orders` | Manajemen pesanan |
| `/admin/orders/[id]` | Detail pesanan |
| `/admin/payments` | Verifikasi pembayaran |
| `/admin/payroll` | Payroll desainer |
| `/admin/cashflow` | Arus kas |
| `/admin/recurring` | Pengeluaran rutin |
| `/admin/quotes` | Manajemen quote |
| `/admin/catalog` | Katalog paket |
| `/admin/portfolio` | Galeri karya |
| `/admin/users` | Manajemen user |
| `/admin/notifications` | Notifikasi |
| `/admin/reports` | Laporan & analitik |
| `/admin/settings` | Pengaturan |
| `/admin/profile` | Profil admin |

---

## Perintah Development

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan development server (Turbopack, hot reload) di http://localhost:3000 |
| `npm run build` | Build production + type check |
| `npm run start` | Menjalankan server production (setelah build) |
| `npm run lint` | Menjalankan ESLint pada folder `src/` |
| `npm run typecheck` | Cek tipe TypeScript tanpa emit file |
| `npm run prisma:seed` | Menjalankan seed data ke database |

Perintah Prisma yang sering digunakan:

| Perintah | Fungsi |
|---|---|
| `npx prisma migrate dev` | Menjalankan migrasi & generate Prisma Client |
| `npx prisma migrate reset` | Reset database & jalankan ulang semua migrasi + seed |
| `npx prisma db seed` | Menjalankan seed data saja |
| `npx prisma studio` | Membuka GUI browser untuk melihat/edit data database |
| `npx prisma generate` | Generate ulang Prisma Client tanpa migrasi |

---

## Struktur Folder

```
gridkita-cms/
├── prisma/
│   ├── schema.prisma          # Skema database (15+ tabel)
│   ├── seed.ts                # Data demo untuk development
│   └── migrations/            # File migrasi SQL
├── public/                    # Aset statis (SVG, gambar)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Halaman login & register
│   │   ├── (public)/          # Halaman publik (landing, katalog, portfolio)
│   │   ├── admin/             # Halaman admin (role: ADMIN)
│   │   ├── dashboard/         # Halaman klien (role: CLIENT)
│   │   ├── designer/          # Halaman desainer (role: DESIGNER)
│   │   ├── actions/           # Server Actions (auth, orders, payments, dll.)
│   │   └── api/               # API Routes (auth, file serving)
│   ├── components/
│   │   ├── ui/                # Komponen shadcn/ui (Button, Card, Dialog, dll.)
│   │   ├── charts/            # Komponen grafik (Recharts)
│   │   └── *.tsx              # Komponen kustom project
│   ├── lib/
│   │   ├── auth.ts            # Konfigurasi Auth.js v5
│   │   ├── db.ts              # Prisma Client singleton
│   │   ├── session.ts         # Helper: getCurrentUser(), requireRole()
│   │   ├── state-machine.ts   # State machine order (11 status)
│   │   ├── payroll.ts         # Kalkulasi komisi (70% desainer / 30% kas)
│   │   ├── queries/           # Fungsi query database (menggantikan mock data)
│   │   ├── mock/              # Data mock (legacy, sudah diganti queries/)
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── index.ts           # TypeScript type definitions (domain types)
├── .env.local                 # Environment variables (TIDAK di-commit)
├── package.json               # Dependencies & scripts
├── tsconfig.json              # Konfigurasi TypeScript
├── next.config.ts             # Konfigurasi Next.js
├── postcss.config.mjs         # Konfigurasi PostCSS + Tailwind
└── eslint.config.mjs          # Konfigurasi ESLint
```

---

## Catatan Penting

- **Komisi desainer** selalu **70% desainer / 30% kas perusahaan** — diatur oleh `COMMISSION_RATE = 0.70` di `src/lib/payroll.ts`
- **State machine order** memiliki 11 status yang diatur di `src/lib/state-machine.ts`. Setiap transisi status dibatasi oleh role user
- **Autentikasi** menggunakan Auth.js v5 dengan Credentials Provider (email + password) dan JWT session
- **RBAC** (Role-Based Access Control) diterapkan via `requireRole()` di setiap layout halaman
- **Tailwind CSS v4** menggunakan CSS variables dengan color space `oklch` — custom tokens ada di `globals.css`
