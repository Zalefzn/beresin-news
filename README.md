<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/logo-dark.png">
  <img src="public/logo.png" alt="BeresinNews" width="320">
</picture>

### Berita. Teknologi. Masa Depan.

Portal berita digital modern untuk **Teknologi**, **Edukasi & Pendidikan**, **Ekonomi**, serta **Sosial & Politik** —<br>
lengkap dengan Live TV, video, bookmark, komentar, newsletter, dan mode gelap.

<br>

[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Inertia](https://img.shields.io/badge/Inertia.js-v3_SSR-9553E9?style=for-the-badge&logo=inertia&logoColor=white)](https://inertiajs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Pest](https://img.shields.io/badge/Tested_with-Pest-F472B6?style=for-the-badge)](https://pestphp.com)

[![Tests](https://github.com/Zalefzn/beresin-news/actions/workflows/tests.yml/badge.svg)](https://github.com/Zalefzn/beresin-news/actions/workflows/tests.yml)

[Fitur](#-fitur-utama) ·
[Tech Stack](#-tech-stack) ·
[Memulai](#-memulai) ·
[Struktur](#-struktur-proyek) ·
[Pengujian](#-pengujian) ·
[Deploy](#-deploy-produksi)

</div>

---

## ✨ Fitur Utama

<table>
<tr>
<td width="50%" valign="top">

### 📰 Portal Publik
- **Beranda** — Sorotan Utama, Topik Hangat, feed berita dengan filter kategori & infinite scroll
- **Detail artikel** — breadcrumb, pengatur ukuran huruf A-/A+, bagikan, "Baca Juga", suka, komentar
- **Kategori, Tag, Indeks & Terpopuler** (24 jam / 7 hari / 30 hari)
- **Pencarian** dengan highlight kata kunci & filter rentang waktu
- **Profil penulis** & **halaman statis** (Pedoman Media Siber, Redaksi, dll.)
- **Breaking news ticker** yang menghormati `prefers-reduced-motion`

</td>
<td width="50%" valign="top">

### 📺 Media & Interaksi
- **Live TV** 24/7 (HLS / YouTube) dengan jadwal program
- **Live chat realtime** via Laravel Reverb + jumlah penonton
- **Video highlights** & liputan khusus
- **Berita tersimpan** — localStorage untuk tamu, tersinkron ke DB saat login
- **Newsletter** dengan double opt-in
- **Mode gelap** light / dark / system tanpa kedipan

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🛠️ Panel Redaksi
- Dashboard statistik & grafik views 30 hari
- Editor artikel rich text, jadwal terbit, autosave, preview SEO
- Alur status `draft → review → scheduled/published → archived`
- Moderasi komentar, breaking news, kategori, tag, pengguna
- Pengaturan situs (kontak redaksi, sosial media, cuaca, harga paket)

</td>
<td width="50%" valign="top">

### 💳 Berita Berbayar & Iklan
- Pembaca dapat **mengirim berita berbayar** lewat `/kirim-berita`
- Pembayaran terintegrasi **Midtrans**
- Persetujuan admin, penolakan & pengajuan ulang tanpa bayar lagi
- Label wajib untuk konten berbayar di halaman publik
- Slot iklan berita berbayar di sidebar dengan masa tayang

</td>
</tr>
</table>

### 🔍 SEO & Performa
SSR Inertia · Open Graph & Twitter Card · JSON-LD `NewsArticle` · `sitemap.xml` & `sitemap-news.xml` (Google News) · RSS per kategori · gambar WebP responsif (`srcset`) · target Lighthouse ≥ 90.

---

## 🧰 Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Backend** | Laravel 13 · PHP 8.4 · Fortify (autentikasi) |
| **Penghubung** | Inertia.js v3 dengan **SSR** |
| **Frontend** | React 19 · TypeScript (strict) · Laravel Wayfinder |
| **Styling** | Tailwind CSS v4 · `@tailwindcss/typography` · shadcn/ui · Font Awesome |
| **Font** | Inter (UI) & Merriweather (serif) |
| **Database** | PostgreSQL (tes: SQLite in-memory) |
| **Pencarian** | Laravel Scout (driver `database`, siap Meilisearch) |
| **Media** | Spatie Media Library (konversi WebP) |
| **Realtime** | Laravel Reverb + Echo |
| **Pembayaran** | Midtrans |
| **Kualitas** | Pest · Larastan · Pint · ESLint · Prettier |
| **Build** | Vite |

---

## 🚀 Memulai

### Prasyarat

- PHP **≥ 8.3** (disarankan 8.4) & Composer
- Node.js **≥ 20** & npm
- PostgreSQL **≥ 15**

### Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/Zalefzn/beresin-news.git
cd beresin-news

# 2. Pasang dependensi & salin .env
composer install
npm install
cp .env.example .env
php artisan key:generate

# 3. Atur koneksi database di .env, lalu migrasi + data contoh
php artisan migrate --seed
php artisan storage:link

# 4. Jalankan server Laravel + Vite + queue + log sekaligus
composer run dev
```

Buka aplikasi di URL yang tertera pada terminal (mis. `http://localhost:8000`).

### Variabel lingkungan penting

| Variabel | Keterangan |
|---|---|
| `DB_CONNECTION`, `DB_*` | Koneksi PostgreSQL |
| `SCOUT_DRIVER` | `database` (default) atau `meilisearch` |
| `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` | Kredensial Reverb untuk live chat |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION` | Pembayaran berita berbayar |
| `MAIL_*` | Pengiriman email newsletter & kontak |

> [!IMPORTANT]
> Jangan pernah meng-commit file `.env` atau kredensial apa pun. Semua rahasia dibaca lewat `config()`.

---

## 📜 Perintah Penting

| Perintah | Fungsi |
|---|---|
| `composer run dev` | Server Laravel + Vite + queue + log |
| `php artisan migrate --seed` | Migrasi & isi data contoh |
| `php artisan test` | Menjalankan seluruh tes Pest |
| `vendor/bin/pint` | Format kode PHP |
| `npm run lint` | Lint TypeScript/React |
| `npm run types` | Cek tipe TypeScript |
| `npm run format` | Format kode frontend |
| `npm run build:ssr` | Build produksi dengan SSR |

---

## 🗂️ Struktur Proyek

```text
app/
├── Actions/              # logika bisnis satu tugas (PublishArticle, RecordArticleView, ...)
├── Enums/                # ArticleStatus, CommentStatus, UserRole
├── Http/
│   ├── Controllers/
│   │   ├── Public/       # halaman publik
│   │   ├── Dashboard/    # dasbor pembaca & kiriman berita
│   │   └── Admin/        # panel redaksi
│   ├── Requests/         # Form Request + pesan Bahasa Indonesia
│   └── Resources/        # API Resource untuk props Inertia
├── Models/ · Policies/ · Jobs/
resources/
├── css/app.css           # token brand (@theme)
└── js/
    ├── pages/            # halaman Inertia
    ├── layouts/          # public-layout, admin-layout
    ├── components/       # ui, layout, news, live, video, newsletter
    ├── hooks/            # use-appearance, use-bookmarks, use-font-size, ...
    ├── lib/              # utils (cn, formatDate, formatNumber)
    └── types/            # tipe bersama
```

---

## 👥 Peran Pengguna

| Peran | Hak Akses |
|---|---|
| 🛡️ **Admin** | Semua akses, termasuk menerbitkan, pengguna & pengaturan |
| ✏️ **Editor** (Redaktur) | Kelola artikel yang belum terbit, moderasi komentar, breaking news, video, jadwal TV |
| 📝 **Writer** (Jurnalis) | Tulis & edit artikel sendiri, ajukan review |
| 👤 **Reader** | Komentar, bookmark, live chat, kirim berita berbayar |

---

## 🎨 Design System

| Token | Warna | Kegunaan |
|---|---|---|
| `brand-blue` | ![#0066FF](https://img.shields.io/badge/-%230066FF-0066FF?style=flat-square) | Tombol utama, link aktif, focus ring |
| `brand-dark-blue` | ![#0040D0](https://img.shields.io/badge/-%230040D0-0040D0?style=flat-square) | Hover tombol utama |
| `brand-navy` | ![#0F172A](https://img.shields.io/badge/-%230F172A-0F172A?style=flat-square) | Gradien newsletter |
| `brand-deep-navy` | ![#0B132B](https://img.shields.io/badge/-%230B132B-0B132B?style=flat-square) | Top bar & footer |
| `brand-red` | ![#E11D48](https://img.shields.io/badge/-%23E11D48-E11D48?style=flat-square) | Breaking, Live, Terpopuler |

Panduan lengkap (tipografi, komponen, dark mode, aturan koding) ada di [`CLAUDE.md`](CLAUDE.md).

---

## 🧪 Pengujian

```bash
php artisan test --compact     # Pest feature & unit test
vendor/bin/pint --test         # cek format PHP
npm run types                  # cek TypeScript
npm run lint                   # ESLint
```

Tes berjalan otomatis di GitHub Actions setiap push melalui workflow [`tests.yml`](.github/workflows/tests.yml).

---

## 🐳 Deploy Produksi

Aplikasi dikemas dengan **Docker** (Nginx + PHP-FPM + Supervisor untuk queue, scheduler, dan Reverb) dan siap berjalan di belakang reverse proxy seperti Traefik.

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Pastikan scheduler berjalan (`php artisan schedule:run` tiap menit) agar penerbitan artikel terjadwal bekerja.

---

<div align="center">

Dibuat dengan ❤️ oleh **Artechmis Solution** untuk **Beresin.id**

<sub>© 2026 BeresinNews. Hak cipta dilindungi.</sub>

</div>
