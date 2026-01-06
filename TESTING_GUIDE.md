# 🚀 Quick Test Guide - Workshop Frontend

## Cara Cepat Testing Fitur Baru

### 1. Start Servers (2 Terminal)

**Terminal 1 - Backend:**
```bash
cd "c:\1. DANY ARDIANSYAH\Project\Laravel\pos_bengkel"
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd "c:\1. DANY ARDIANSYAH\Project\Laravel\pos_bengkel"
npm run dev
```

### 2. Login & Access

Buka browser: `http://localhost:8000`

Login dengan user admin Anda.

---

## 📋 Testing Checklist

### ✅ Dashboard (Homepage)
**URL:** `/dashboard`

**Yang Harus Terlihat:**
- [ ] Section "Dashboard" dengan stats retail (original)
- [ ] Section "Statistik Bengkel" (NEW)
- [ ] 4 kartu besar: Pendapatan Hari Ini, Order Menunggu, Sedang Dikerjakan, Selesai Hari Ini
- [ ] 4 kartu kecil: Total Service Order, Mekanik Aktif (X/Y), Stok Sparepart, Stok Menipis
- [ ] Semua angka muncul (tidak null/undefined)

**Test:**
- [ ] Klik "Stok Menipis" → harus redirect ke halaman parts

---

### ✅ Kategori Layanan (Service Categories)
**URL:** `/dashboard/service-categories`

**Test Create:**
1. [ ] Klik "Tambah Kategori"
2. [ ] Isi form:
   - Nama: "Test Kategori Service"
   - Deskripsi: "Deskripsi test"
   - Icon: "🔧"
   - Urutan: 10
3. [ ] Klik "Simpan"
4. [ ] Muncul toast hijau "berhasil ditambahkan"
5. [ ] Redirect ke list, kategori baru muncul di tabel

**Test Search:**
1. [ ] Ketik "Test" di search box
2. [ ] Klik "Cari"
3. [ ] Tabel hanya menampilkan hasil yang cocok

**Test Edit:**
1. [ ] Klik "Edit" pada kategori yang baru dibuat
2. [ ] Ubah nama menjadi "Test Kategori Updated"
3. [ ] Klik "Simpan Perubahan"
4. [ ] Muncul toast "berhasil diperbarui"
5. [ ] Nama berubah di list

**Test Delete:**
1. [ ] Klik "Hapus" pada kategori test
2. [ ] Muncul konfirmasi dialog
3. [ ] Klik OK
4. [ ] Muncul toast "berhasil dihapus"
5. [ ] Kategori hilang dari list

**Test Dark Mode:**
1. [ ] Toggle dark mode (jika ada switch)
2. [ ] Semua teks tetap terbaca
3. [ ] Tidak ada background putih terang

---

### ✅ Kategori Sparepart (Part Categories)
**URL:** `/dashboard/part-categories`

**Test (sama seperti Service Categories):**
- [ ] Create dengan icon 🔩
- [ ] Search
- [ ] Edit
- [ ] Delete
- [ ] Dark mode

---

### ✅ Layanan (Services)
**URL:** `/dashboard/services`

**Test Create:**
1. [ ] Klik "Tambah Layanan"
2. [ ] Isi form:
   - Kategori: Pilih "Tune Up & Maintenance"
   - Nama: "Test Service Ganti Oli"
   - Deskripsi: "Service ganti oli test"
   - Harga: 75000
   - Durasi: 45
   - Kompleksitas: Sederhana
   - Alat: "Kunci pas, Wadah oli, Lap"
   - Status: Aktif
3. [ ] Klik "Simpan"
4. [ ] Muncul toast sukses
5. [ ] Di list, periksa:
   - [ ] Category badge muncul dengan icon
   - [ ] Complexity badge hijau "Sederhana"
   - [ ] Status badge hijau "Aktif"
   - [ ] Harga format Rp 75.000
   - [ ] Durasi "45 menit"

**Test Edit:**
1. [ ] Klik "Edit" pada service test
2. [ ] Ubah kompleksitas menjadi "Kompleks"
3. [ ] Simpan
4. [ ] Badge kompleksitas berubah jadi merah "Kompleks"

**Test Display:**
- [ ] Icon kategori muncul dengan benar
- [ ] Deskripsi ter-truncate jika terlalu panjang
- [ ] Pagination muncul jika > 10 data

---

### ✅ Service Orders (Enhanced)
**URL:** `/dashboard/service-orders`

**Yang Harus Terlihat:**
- [ ] Tabel dengan kolom: No Order, Pelanggan & Kendaraan, Mekanik, Tanggal, Biaya, Status
- [ ] Di kolom "Pelanggan & Kendaraan": nama customer dan info motor (brand model - plat)
- [ ] Di kolom "Tanggal": scheduled date, dan jika ada actual_start/finish_at
- [ ] Di kolom "Biaya": 
  - Total (bold)
  - Jasa: Rp X
  - Part: Rp Y
- [ ] Status badge berwarna (kuning=menunggu, biru=dikerjakan, hijau=selesai)
- [ ] Tombol "Detail" untuk setiap order

**Test Search:**
1. [ ] Ketik nomor order atau nama customer
2. [ ] Klik "Cari"
3. [ ] Filter bekerja

---

## 🎨 Visual Checks

### Consistency
- [ ] Semua halaman menggunakan AppLayout yang sama
- [ ] Header dengan title dan button "Tambah" di kanan
- [ ] Search box dengan icon search di kiri
- [ ] Tabel dengan border dan hover effect
- [ ] Pagination sama di semua list

### Responsive
- [ ] Resize browser jadi kecil
- [ ] Grid berubah jadi 1 kolom di mobile
- [ ] Tombol tetap accessible
- [ ] Table scroll horizontal jika perlu

### Colors & Icons
- [ ] Icon muncul di semua tempat (Tabler Icons)
- [ ] Badge dengan warna yang tepat:
  - Hijau: aktif, selesai, sederhana
  - Kuning: menunggu, warning
  - Biru: dikerjakan, info
  - Merah: kompleks, dibatalkan
- [ ] Gradient cards di dashboard terlihat menarik

---

## 🐛 Common Issues & Fixes

### Issue: "route not found"
**Fix:** Pastikan routes sudah ada di `routes/web.php`
```bash
php artisan route:list | grep service-categories
```

### Issue: "Undefined property: workshop"
**Fix:** Pastikan DashboardController mengirim data workshop
```bash
php artisan tinker
>>> App\Models\ServiceOrder::count()
```

### Issue: "Icon tidak muncul"
**Fix:** Pastikan import Tabler Icons benar
```jsx
import { IconPlus, IconSearch } from '@tabler/icons-react';
```

### Issue: "Dark mode tidak jalan"
**Fix:** Pastikan Tailwind configured untuk dark mode
```js
// tailwind.config.js
darkMode: 'class',
```

### Issue: "Toast tidak muncul"
**Fix:** Pastikan react-hot-toast ter-install
```bash
npm install react-hot-toast
```

---

## ✨ Expected Results

Setelah semua test berhasil, Anda harus bisa:

✅ Melihat dashboard dengan 8 statistik bengkel  
✅ Create, read, update, delete service categories  
✅ Create, read, update, delete part categories  
✅ Create, read, update, delete services dengan category integration  
✅ Melihat service orders dengan breakdown biaya dan timing  
✅ Search dan pagination di semua list  
✅ Dark mode bekerja di semua halaman  
✅ Toast notification muncul untuk setiap action  
✅ Badge dan icon display dengan benar  

---

## 📊 Data Verification

**Verifikasi Data di Database:**
```bash
php artisan tinker
```

```php
// Check categories
\App\Models\ServiceCategory::count(); // Should be 9
\App\Models\PartCategory::count();    // Should be 9

// Check services
\App\Models\Service::count();         // Should be 17+

// Check service orders
\App\Models\ServiceOrder::count();    // Check if any exists

// Check workshop stats
\App\Models\ServiceOrder::where('status', 'pending')->count();
\App\Models\Mechanic::where('status', 'active')->count();
\App\Models\Part::whereColumn('stock', '<=', 'reorder_level')->count();
```

---

**Jika Semua Test Passed:** 🎉
Sistem POS Bengkel Motor Anda sudah siap digunakan!

**Jika Ada Issue:**
1. Check browser console (F12) untuk error JavaScript
2. Check Laravel log: `storage/logs/laravel.log`
3. Check network tab untuk request yang gagal
4. Verify permissions: user harus punya role admin

---

**Good Luck Testing!** 🚀
