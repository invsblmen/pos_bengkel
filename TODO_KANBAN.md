# Kanban Board - Next Implementation

Gunakan board ini untuk tracking eksekusi berikutnya lintas device.

Aturan pakai singkat:

- Pindahkan task antar kolom dengan cut/paste.
- Simpan format checkbox agar progress mudah dibaca.
- Gunakan tag: `[GARANSI]`, `[VOUCHER]`, `[SO-REF]`, `[TEST]`, `[INFRA]`, `[UI]`.

## To Do

- [ ] [TEST] Tambahkan feature test untuk `customers.show` (akses valid, akses unauthorized, data relasi terbaca).
- [ ] [TEST] Tambahkan test fallback route referensi mekanik pada detail service order.
- [ ] [UI] Tambahkan sticky action bar pada detail service order (cetak, edit, kembali).
- [ ] [UI] Tambahkan loading skeleton untuk section detail item pada service order show.
- [ ] [INFRA] Tambahkan rotasi sederhana untuk log watchdog (`reverb-autostart.log`, `reverb-watchdog.log`) agar ukuran file terkendali.
- [ ] [INFRA] Tambahkan command status ringkas untuk watchdog Reverb (cek proses + port + pid file).
- [ ] [SO-REF] Lengkapi endpoint detail mekanik (`mechanics.show`) atau finalisasi keputusan tetap di performance page.
- [ ] [VOUCHER] Tambahkan validasi edge-case kombinasi voucher + diskon fixed besar di service order.
- [ ] [GARANSI] Tambahkan indikator visual item garansi yang sudah mendekati expired pada detail service order.

## In Progress

- [ ] [TEST] Konsolidasi dan stabilisasi test suite domain garansi + voucher + service-order references.

## Blocked

- [ ] [INFRA] Otomatisasi startup berbasis Task Scheduler event Herd start (menunggu hak akses admin lokal).

## Catatan Operasional

- Setelah perubahan route backend, regenerate Ziggy:
  - `php artisan ziggy:generate resources/js/ziggy.js`
- Untuk cek scheduler aktif:
  - `php artisan schedule:list`
- Untuk cek health Reverb dari app runtime:
  - `php artisan reverb:health-check`
