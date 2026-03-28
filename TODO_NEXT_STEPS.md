# TODO Lanjutan Pengembangan (Lintas Device)

Dokumen ini berisi rencana kerja berikutnya setelah batch implementasi 2026-03-28.

## Fokus Iterasi Berikutnya

1. Stabilisasi test suite untuk domain garansi, voucher, dan service order references.
2. Penyempurnaan UX halaman detail service order (navigasi, sticky actions, loading states).
3. Penguatan observability lokal untuk realtime Reverb (watchdog + log maintenance).

## Prioritas Eksekusi

### Prioritas 1 - Testing dan Quality Gate

- [ ] Tambah feature test untuk halaman `customers.show` (render, relasi, permission).
- [ ] Tambah test untuk fallback route mekanik di detail service order.
- [ ] Tambah test regresi untuk clickable references (`customer`, `vehicle`, `mechanic`) di service order detail.
- [ ] Tambah test edge-case voucher pada kombinasi diskon fixed/percent dan batas maksimum diskon.
- [ ] Jalankan subset test cepat sebagai smoke suite untuk domain workshop core.

### Prioritas 2 - UX Detail Service Order

- [ ] Tambahkan sticky action bar (kembali, cetak, edit) pada layar desktop.
- [ ] Tambahkan loading skeleton untuk blok detail item saat payload besar.
- [ ] Tambahkan quick jump anchor antar section (info utama, biaya, item, catatan).
- [ ] Optimasi spacing dan typographic hierarchy agar informasi finansial lebih mudah dipindai.

### Prioritas 3 - Infra Realtime Lokal

- [ ] Tambah utilitas command status watchdog (`port`, `pid`, `process`, `last log lines`).
- [ ] Tambah housekeeping untuk log watchdog (truncate/rotate mingguan).
- [ ] Tambah guard agar startup launcher tidak spawn process orphan saat logout/login berulang.
- [ ] Dokumentasikan troubleshooting standar saat Reverb unreachable di dev environment.

## Backlog Opsional

- [ ] Tambahkan visual indicator aging untuk klaim garansi (mis. 7 hari sebelum expiry).
- [ ] Tambahkan dashboard conversion voucher (issued vs redeemed vs expired).
- [ ] Tambahkan opsi notifikasi internal untuk anomali stok setelah service order finalisasi.

## Catatan Operasional

- Setelah perubahan route backend, regenerate Ziggy:
  - `php artisan ziggy:generate resources/js/ziggy.js`
- Untuk cek scheduler:
  - `php artisan schedule:list`
- Untuk cek health Reverb dari app runtime:
  - `php artisan reverb:health-check`
