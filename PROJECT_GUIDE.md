# Project Guide - POS Bengkel

Panduan terpusat untuk setup, pengembangan, testing, dan referensi fitur utama.

## Daftar Isi

1. [1. Ringkasan Proyek](#1-ringkasan-proyek)
2. [2. Tech Stack](#2-tech-stack)
3. [3. Setup Cepat (Device Baru)](#3-setup-cepat-device-baru)
4. [4. Troubleshooting Umum](#4-troubleshooting-umum)
5. [5. SOP Pengembangan Fitur Baru](#5-sop-pengembangan-fitur-baru)
6. [6. Ringkasan Fitur Diskon & Pajak](#6-ringkasan-fitur-diskon--pajak)
7. [7. Frontend Payload Acuan](#7-frontend-payload-acuan)
8. [8. Inline Creation (Part Category/Supplier)](#8-inline-creation-part-categorysupplier)
9. [9. Testing Cepat](#9-testing-cepat)
10. [10. Konvensi Penamaan](#10-konvensi-penamaan)
11. [11. Checklist Singkat Harian](#11-checklist-singkat-harian)

## 1. Ringkasan Proyek

POS Bengkel adalah sistem kasir dan operasional bengkel motor berbasis Laravel + Inertia + React.

Cakupan utama:
1. Service order dan appointment
2. Manajemen mekanik, kendaraan, pelanggan
3. Inventori sparepart, pembelian, dan penjualan
4. Payment, invoice, dan reporting

## 2. Tech Stack

1. Laravel 12
2. Inertia.js + React 18
3. Tailwind CSS 3
4. Spatie Laravel Permission
5. Laravel Reverb + Laravel Echo

## 3. Setup Cepat (Device Baru)

### 3.1 Prasyarat

1. PHP 8.4+
2. Composer 2+
3. Node.js 20+ dan npm
4. MySQL/MariaDB
5. Laravel Herd (opsional, direkomendasikan di Windows)

### 3.2 Install

```bash
git clone https://github.com/invsblmen/pos_bengkel.git
cd pos_bengkel
composer install
npm install
copy .env.example .env
php artisan key:generate
```

### 3.3 Konfigurasi `.env` minimum

```env
APP_NAME="POSBengkel"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://pos-bengkel.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel12_pos_bengkel
DB_USERNAME=root
DB_PASSWORD=root

BROADCAST_CONNECTION=reverb

REVERB_APP_ID=pos-bengkel-app
REVERB_APP_KEY=pos-bengkel-key
REVERB_APP_SECRET=pos-bengkel-secret
REVERB_HOST=pos-bengkel.test
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

Catatan:
1. Gunakan domain tanpa underscore.
2. Hindari `pos_bengkel.test` karena bisa memicu redirect/browser issue.

### 3.4 Setup Herd (opsional)

```bash
cd ..
herd forget
cd pos_bengkel
herd unlink pos_bengkel
herd link pos-bengkel
herd links
herd sites
```

Opsional HTTPS:

```bash
herd secure pos-bengkel
```

Jika HTTPS aktif:

```env
APP_URL=https://pos-bengkel.test
REVERB_SCHEME=https
```

### 3.5 Database dan Run

```bash
php artisan migrate --seed
php artisan storage:link
php artisan config:clear
```

Jalankan aplikasi:

```bash
php artisan reverb:start
npm run dev
php artisan serve
```

Jika pakai Herd, `php artisan serve` tidak wajib.

## 4. Troubleshooting Umum

1. `Failed to resolve import "laravel-echo"`

```bash
npm install
npm ls laravel-echo pusher-js --depth=0
```

2. `You must pass your app key when you instantiate Pusher`

Periksa `VITE_REVERB_APP_KEY` di `.env` dan restart Vite.

3. `Class "Pusher\\Pusher" not found`

```bash
composer require pusher/pusher-php-server
```

4. Perubahan `.env` tidak terbaca

```bash
php artisan config:clear
```

5. Port Vite 5173 terpakai

Normal, Vite akan pindah ke port lain.

## 5. SOP Pengembangan Fitur Baru

### 5.1 Backend

1. Buat controller: `php artisan make:controller Apps/NamaController`
2. Buat model+migration: `php artisan make:model NamaModel -m`
3. Lengkapi schema, fillable, casts, relasi
4. Jalankan migration: `php artisan migrate`
5. Tambahkan route + middleware permission di `routes/web.php`

### 5.2 Permission

Buat permission minimal:
1. `resource-access`
2. `resource-create`
3. `resource-update`
4. `resource-delete`

Assign ke role admin dan user test.

### 5.3 Frontend

1. Tambah page di `resources/js/Pages/Dashboard/NamaFitur/`
2. Minimal `Index.jsx`, `Create.jsx`, `Edit.jsx`
3. Tambah menu di `resources/js/Utils/Menu.jsx`
4. Pastikan route name konsisten frontend-backend

### 5.4 Verifikasi

```bash
php artisan route:clear
php artisan cache:clear
php artisan config:clear
php artisan route:list --name=resource-name
npm run build
```

## 6. Ringkasan Fitur Diskon & Pajak

Dukungan diskon/pajak ada di:
1. Purchases
2. Part Purchases
3. Part Sales
4. Service Orders

Tipe:
1. `none`
2. `percent`
3. `fixed`

Level:
1. Item-level discount (detail rows)
2. Transaction-level discount
3. Transaction-level tax

Formula inti:
1. `amount_after_discount = subtotal - discount_amount`
2. `grand_total = amount_after_discount + tax_amount`

Service utama: `App\Services\DiscountTaxService` untuk validasi dan kalkulasi total.

## 7. Frontend Payload Acuan

Contoh field penting untuk form transaksi:

```json
{
  "items": [
    {
      "part_id": 1,
      "qty": 2,
      "unit_price": 100000,
      "discount_type": "percent",
      "discount_value": 10
    }
  ],
  "discount_type": "percent",
  "discount_value": 5,
  "tax_type": "percent",
  "tax_value": 10
}
```

## 8. Inline Creation (Part Category/Supplier)

Fitur inline creation tersedia pada form pembuatan part.

Endpoint:
1. `POST /part-categories/storeAjax`
2. `POST /suppliers/storeAjax`

Tujuan:
1. Tambah category/supplier tanpa keluar dari form part
2. Item baru langsung bisa dipilih

## 9. Testing Cepat

### 9.1 Smoke test

1. Login sebagai admin
2. Buka dashboard
3. Uji CRUD:
- service categories
- part categories
- services
4. Uji service order list dan filter
5. Cek toast/error di browser

### 9.2 Data check (opsional)

```bash
php artisan tinker
```

```php
App\Models\ServiceCategory::count();
App\Models\PartCategory::count();
App\Models\Service::count();
App\Models\ServiceOrder::count();
```

## 10. Konvensi Penamaan

1. URL: kebab-case (contoh: `/dashboard/service-categories`)
2. Route name: `resource.action` (contoh: `service-categories.index`)
3. Permission: `resource-action` (contoh: `service-categories-access`)
4. Controller/Model: PascalCase

## 11. Checklist Singkat Harian

```bash
composer install
npm install
php artisan migrate --seed
php artisan config:clear
php artisan reverb:start
npm run dev
```

Dokumen ini menggantikan catatan teknis terpisah yang sebelumnya tersebar di banyak file markdown.
