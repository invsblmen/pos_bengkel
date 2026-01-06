# Development Checklist - POS Bengkel

## ⚠️ WAJIB DIIKUTI: Checklist untuk Fitur Baru dengan Routes & Permissions

Setiap kali membuat fitur baru yang memerlukan routes dan permissions, **SELALU** ikuti langkah-langkah berikut secara berurutan:

### 1. Backend Setup

#### a. Controller
- [ ] Buat controller dengan artisan: `php artisan make:controller Apps/NamaController`
- [ ] Implementasi methods: `index()`, `create()`, `store()`, `show()`, `update()`, `destroy()`
- [ ] Pastikan return Inertia::render() untuk views

#### b. Models & Migrations
- [ ] Buat model & migration: `php artisan make:model NamaModel -m`
- [ ] Definisikan schema di migration (fields, indexes, foreign keys)
- [ ] Jalankan migration: `php artisan migrate`
- [ ] Tambahkan fillable, casts, relationships di model

#### c. Routes - **CRITICAL!**
- [ ] **Import controller** di `routes/web.php`:
  ```php
  use App\Http\Controllers\Apps\NamaController;
  ```
- [ ] Definisikan routes **di dalam Route::group** dengan prefix 'dashboard':
  ```php
  Route::get('/resource-name', [NamaController::class, 'index'])
      ->middleware('permission:resource-access')
      ->name('resource.index');
  ```
- [ ] Pastikan route name konsisten dengan yang dipanggil di frontend

### 2. Permissions Setup - **SANGAT PENTING!**

#### a. Create Permissions di Database
```bash
php artisan tinker --execute="
Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'resource-access', 'guard_name' => 'web']);
Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'resource-create', 'guard_name' => 'web']);
Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'resource-update', 'guard_name' => 'web']);
Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'resource-delete', 'guard_name' => 'web']);
echo 'Permissions created';
"
```

#### b. Assign ke Admin Role
```bash
php artisan tinker --execute="
\$admin = Spatie\Permission\Models\Role::where('name', 'admin')->first();
if (\$admin) {
    \$admin->givePermissionTo(['resource-access', 'resource-create', 'resource-update', 'resource-delete']);
    echo 'Admin role updated';
}
"
```

#### c. Assign ke Current User (untuk testing)
```bash
php artisan tinker --execute="
\$u = \App\Models\User::find(1);
if (\$u) {
    \$u->givePermissionTo(['resource-access', 'resource-create', 'resource-update', 'resource-delete']);
    echo \$u->email . ' - Permissions granted';
}
"
```

#### d. Update PermissionSeeder untuk future
Tambahkan di `database/seeders/PermissionSeeder.php`:
```php
// resource name
Permission::create(['name' => 'resource-access']);
Permission::create(['name' => 'resource-create']);
Permission::create(['name' => 'resource-update']);
Permission::create(['name' => 'resource-delete']);
```

### 3. Frontend Setup

#### a. Create Views/Components
- [ ] Buat folder di `resources/js/Pages/Dashboard/NamaFitur/`
- [ ] Buat files: `Index.jsx`, `Create.jsx`, `Edit.jsx` (jika perlu), `Show.jsx` (jika perlu)
- [ ] Import DashboardLayout dan components yang diperlukan
- [ ] Export default function dengan props yang sesuai

#### b. Update Menu Navigation
- [ ] Edit `resources/js/Utils/Menu.jsx`
- [ ] Tambahkan menu item di section yang sesuai:
  ```jsx
  {
      title: "Nama Menu",
      href: route("resource.index"),
      active: url.includes("/dashboard/resource-name"),
      icon: <IconName size={20} strokeWidth={1.5} />,
      permissions: hasAnyPermission(["resource-access"]),
  },
  ```
- [ ] Pastikan icon sudah diimport dari `@tabler/icons-react`

### 4. Cache & Verification - **SELALU JALANKAN!**

```bash
# Clear all caches
php artisan route:clear
php artisan cache:clear
php artisan config:clear

# Verify routes registered
php artisan route:list --name=resource-name

# Rebuild frontend
npm run build
```

### 5. Testing Checklist

- [ ] Login ke aplikasi
- [ ] Cek menu sidebar - apakah menu baru muncul?
- [ ] Klik menu - apakah route bekerja?
- [ ] Test create new record
- [ ] Test edit existing record
- [ ] Test delete record
- [ ] Cek console browser untuk errors
- [ ] Cek Laravel log: `storage/logs/laravel.log`

---

## Common Issues & Solutions

### Issue: Menu tidak muncul di sidebar
**Penyebab:**
- Permission belum dibuat di database
- User belum mendapat permission
- Cache belum di-clear

**Solusi:**
1. Jalankan langkah 2a-2c di atas
2. Clear cache: `php artisan cache:clear`
3. Rebuild: `npm run build`

### Issue: Route tidak ditemukan (404)
**Penyebab:**
- Controller belum diimport di routes/web.php
- Route tidak di dalam Route::group dengan prefix 'dashboard'
- Nama route tidak match dengan yang dipanggil

**Solusi:**
1. Cek import controller di routes/web.php
2. Verify dengan: `php artisan route:list --name=xxx`
3. Clear route cache: `php artisan route:clear`

### Issue: Permission denied
**Penyebab:**
- Permission belum dibuat
- User/Role belum diberi permission
- Middleware salah

**Solusi:**
1. Create permission (langkah 2a)
2. Assign ke role & user (langkah 2b-2c)
3. Logout dan login lagi

### Issue: Blank page / Component not loading
**Penyebab:**
- Component file tidak ada
- Export default tidak ada
- Props tidak sesuai dengan yang dikirim controller

**Solusi:**
1. Cek file component ada di path yang benar
2. Pastikan `export default function NamaComponent({ props }) {}`
3. Cek Network tab di browser untuk response data
4. Rebuild frontend: `npm run build`

---

## Naming Conventions

### Routes
- URL: `/dashboard/resource-name` (kebab-case)
- Name: `resource-name.action` (kebab-case dengan titik)
- Example: `resource-name.index`, `resource-name.create`

### Permissions
- Format: `resource-name-action` (kebab-case dengan dash)
- Example: `resource-name-access`, `resource-name-create`, `resource-name-update`, `resource-name-delete`

### Controllers
- Namespace: `App\Http\Controllers\Apps`
- Class name: `NamaController` (PascalCase)
- File: `app/Http/Controllers/Apps/NamaController.php`

### Models
- Namespace: `App\Models`
- Class name: `NamaModel` (PascalCase, singular)
- Table name: `nama_models` (snake_case, plural)

### Components/Views
- Path: `resources/js/Pages/Dashboard/NamaFitur/`
- Files: `Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx` (PascalCase)

---

## Quick Commands Reference

```bash
# Create Controller
php artisan make:controller Apps/NamaController

# Create Model + Migration
php artisan make:model NamaModel -m

# Create Factory
php artisan make:factory NamaFactory

# Run Migration
php artisan migrate

# Rollback Last Migration
php artisan migrate:rollback

# Clear Caches
php artisan route:clear && php artisan cache:clear && php artisan config:clear

# List Routes
php artisan route:list
php artisan route:list --name=xxx

# Create Permission (Tinker)
php artisan tinker --execute="Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'xxx', 'guard_name' => 'web']);"

# Build Frontend
npm run build
npm run dev
```

---

**Terakhir diupdate:** 2026-01-06
**Catatan:** Checklist ini WAJIB diikuti untuk menghindari masalah yang sama berulang kali.
