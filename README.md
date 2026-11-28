# ShareFood — Platform Berbagi Makanan & Self-Pickup Lokal

**ShareFood** adalah aplikasi web berbasis **Next.js (App Router)**, **Prisma ORM**, dan **Supabase PostgreSQL** untuk mengurangi sampah makanan (*food waste*) dan membantu sesama melalui fitur berbagi makanan gratis maupun penjualan menu UMKM lokal (*self-pickup*).

🌐 **Live Demo:** https://sharefood-id.netlify.app

---

## Fitur Utama

- **Autentikasi Nyata & Proteksi Middleware**
  - Registrasi & login menggunakan *password hashing* (`crypto.scryptSync` + `timingSafeEqual`) dan *HTTP-only session cookie* (`sharefood_session`).
  - Proteksi halaman privat & API mutasi langsung di level **Next.js Middleware** (`src/middleware.ts`) — pengguna yang belum login otomatis diarahkan ke `/login`.
- **Dua Peran Fleksibel (`role-select`)**
  - **Ambil / Pesan Makanan (`/ambil-makanan`)**: Cari makanan gratis maupun menu toko berbayar (dengan modal QRIS), pantau status pesanan secara *real-time*, dan lihat riwayat transaksi.
  - **Posting & Kelola Makanan (`/post-makanan`)**: Tambah menu gratis/berbayar, kelola stok porsi (stok `0` disembunyikan dari daftar pembeli namun tetap tampil di *Kelola Post* agar mudah di-restock), konfirmasi/tolak pesanan masuk, dan pantau rekap omzet.
- **Deteksi Lokasi & Filter Radius Otomatis**
  - Deteksi koordinat GPS pengguna saat login/akses, ekstraksi koordinat dari link Google Maps, serta pengurutan produk terdekat dan filter radius (`1 km`, `3 km`, `5 km`, `Semua Jarak`) menggunakan rumus **Haversine**.
- **Batas Harian Makanan Gratis (3/Hari WIB)**
  - Setiap pengguna dibatasi maksimal **3 pengambilan makanan gratis per hari** (reset pukul 00:00 WIB) agar distribusi merata, sedangkan **Menu Berbayar** tetap tanpa batas.
- **Performa & Optimasi Media**
  - Kompresi foto produk & QRIS otomatis di sisi klien sebelum upload, *offload* gambar ke endpoint `/api/media/[type]/[id]` dengan *HTTP caching*, *optimistic UI*, serta *stale-while-revalidate cache*.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Bahasa:** TypeScript 5
- **Styling:** Tailwind CSS 4 + Custom CSS
- **ORM & Database:** Prisma 6 + Supabase PostgreSQL
- **Hosting:** Netlify (`@netlify/plugin-nextjs`)

---

## Struktur Proyek

```text
sharefood/
├── prisma/
│   ├── schema.prisma               # Skema database & relasi PostgreSQL (Prisma)
│   └── seed.ts                     # Seeder data awal akun & produk
├── public/                         # Aset statis publik
├── src/
│   ├── middleware.ts               # Proteksi autentikasi rute privat & API mutasi
│   ├── app/
│   │   ├── globals.css             # Styling global & tema warna ShareFood
│   │   ├── layout.tsx              # Root layout & AppProvider
│   │   ├── page.tsx                # Halaman beranda (landing page)
│   │   ├── login/
│   │   │   └── page.tsx            # Halaman masuk akun
│   │   ├── daftar/
│   │   │   └── page.tsx            # Halaman pendaftaran akun baru
│   │   ├── role-select/
│   │   │   └── page.tsx            # Pemilihan peran (Ambil / Post Makanan)
│   │   ├── ambil-makanan/
│   │   │   └── page.tsx            # Katalog makanan gratis, berbayar, status & riwayat
│   │   ├── post-makanan/
│   │   │   └── page.tsx            # Form posting, pesanan masuk, kelola post & omzet
│   │   ├── profil-penerima/
│   │   │   └── page.tsx            # Profil pengguna (mode penerima)
│   │   ├── profil-penjual/
│   │   │   └── page.tsx            # Profil toko/donatur (mode penjual)
│   │   ├── panduan/
│   │   │   └── page.tsx            # Panduan keamanan & penggunaan
│   │   ├── dashboard/              # Halaman dashboard & riwayat terstruktur
│   │   ├── makanan/                # Halaman detail, buat & edit makanan
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── route.ts        # POST login & DELETE logout
│   │       │   └── register/
│   │       │       └── route.ts    # POST registrasi akun baru
│   │       ├── data/
│   │       │   └── route.ts        # GET snapshot sesi, foods, requests & activities
│   │       ├── foods/
│   │       │   ├── route.ts        # POST buat postingan makanan baru
│   │       │   └── [id]/
│   │       │       ├── route.ts    # PUT edit menu/stok & DELETE hapus post
│   │       │       ├── cancel/
│   │       │       │   └── route.ts # POST batalkan postingan
│   │       │       └── taken/
│   │       │           └── route.ts # POST selesaikan serah terima pesanan
│   │       ├── requests/
│   │       │   ├── route.ts        # POST buat permintaan ambil/pesan makanan
│   │       │   └── [id]/
│   │       │       ├── approve/
│   │       │       │   └── route.ts # POST setujui pesanan
│   │       │       ├── decline/
│   │       │       │   └── route.ts # POST tolak pesanan
│   │       │       └── cancel/
│   │       │           └── route.ts # POST batalkan pesanan
│   │       ├── media/
│   │       │   └── [type]/[id]/
│   │       │       └── route.ts    # GET layanan gambar produk & QRIS dengan cache
│   │       └── users/
│   │           └── profile/
│   │               └── route.ts    # PUT pembaruan profil pengguna
│   ├── components/
│   │   ├── AppNavbar.tsx           # Navigasi utama aplikasi
│   │   ├── DashboardHeader.tsx     # Header dashboard
│   │   └── DashboardSidebar.tsx    # Sidebar dashboard
│   ├── context/
│   │   └── AppContext.tsx          # State global, optimistic UI & sinkronisasi API
│   ├── lib/
│   │   ├── auth.ts                 # Utilitas hashing password & manajemen sesi
│   │   ├── db.ts                   # Layer query & mutasi Prisma ORM
│   │   ├── geo.ts                  # Perhitungan jarak Haversine & ekstraksi Maps
│   │   └── prisma.ts               # Singleton PrismaClient
│   └── types/
│       └── index.ts                # Definisi tipe TypeScript (User, FoodItem, dll.)
├── netlify.toml                    # Konfigurasi build & plugin Next.js untuk Netlify
├── next.config.ts                  # Konfigurasi Next.js
├── package.json                    # Dependensi & skrip NPM
└── tsconfig.json                   # Konfigurasi TypeScript
```

---

## Relasi Database (`prisma/schema.prisma`)

- `User` memiliki relasi *one-to-many* ke `Account`, `Session`, `Food`, `PickupRequest`, dan `Activity` (`onDelete: Cascade`).
- `Food` memiliki relasi ke `FoodImage[]` (*one-to-many*), `PickupDetail?` (*one-to-one*), dan `PickupRequest[]` (*one-to-many*) dengan `onDelete: Cascade`.

---

## Cara Menjalankan Secara Lokal

1. **Masuk ke direktori proyek dan install dependensi:**
   ```bash
   cd sharefood
   npm install
   ```

2. **Konfigurasi file `.env`:**
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
   ```

3. **Sinkronisasi skema database & isi data awal (opsional):**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Skrip NPM Tersedia

| Perintah | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan server development Next.js |
| `npm run build` | Generate Prisma Client dan build produksi Next.js |
| `npm run start` | Menjalankan server hasil build produksi |
| `npm run db:push` | Push skema `prisma/schema.prisma` ke PostgreSQL |
| `npm run db:seed` | Menjalankan seeder `prisma/seed.ts` |
| `npm run db:studio` | Membuka antarmuka visual Prisma Studio |

---

## Deployment (Netlify)

Proyek ini menggunakan `netlify.toml` dengan `@netlify/plugin-nextjs`. Pastikan environment variables `DATABASE_URL` dan `DIRECT_URL` sudah disetel di dashboard Netlify sebelum melakukan deploy.
