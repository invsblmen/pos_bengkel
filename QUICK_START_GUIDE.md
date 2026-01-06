# Quick Start Guide - POS Bengkel Motor

## ✅ Setup Sudah Selesai!

Sistem POS Bengkel Motor sudah siap digunakan dengan:
- **9 Service Categories** (Tune Up, Engine, Transmission, dll)
- **9 Part Categories** (Engine Parts, Electrical, Brake, dll)
- **17 Services** (dari Ganti Oli hingga Overhaul Mesin)
- **39 Permissions** untuk role admin
- **Routes lengkap** untuk semua fitur workshop

## 🚀 Testing Endpoints

### 1. Service Categories
```bash
# List semua kategori layanan
curl http://localhost:8000/dashboard/service-categories

# Atau via browser (perlu login):
http://localhost:8000/dashboard/service-categories
```

### 2. Part Categories
```bash
# List semua kategori parts
http://localhost:8000/dashboard/part-categories
```

### 3. Services
```bash
# List semua layanan servis
http://localhost:8000/dashboard/services
```

## 📊 Data yang Tersedia

### Service Categories (9)
1. Tune Up & Maintenance
2. Engine Service
3. Transmission & Clutch
4. Electrical & Battery
5. Brake System
6. Suspension & Chassis
7. Body & Painting
8. Wheel & Tire
9. Diagnostics

### Part Categories (9)
1. Engine Parts
2. Transmission & Clutch
3. Electrical Parts
4. Brake Parts
5. Suspension Parts
6. Wheel & Tire
7. Filters & Fluids
8. Fasteners & Hardware
9. Accessories

### Sample Services (17)
- Ganti Oli & Filter (Rp 100,000)
- Busi & Pembersihan Filter Udara (Rp 75,000)
- Tune Up Major (Rp 200,000)
- Overhaul Mesin (Rp 1,500,000)
- Perbaikan Head Silinder (Rp 800,000)
- Dan 12 layanan lainnya...

## 🔐 Login & Permissions

### Default Admin
Jika sudah ada user admin, permission workshop sudah di-assign otomatis.

### Permissions yang Tersedia
- **service-categories-*** (access, create, edit, delete)
- **part-categories-*** (access, create, edit, delete)
- **services-*** (access, create, edit, delete)
- **service-orders-*** (access, create, update, delete)
- **appointments-*** (access, create, update, delete)
- **mechanics-*** (access, create, update, delete)
- **suppliers-*** (access, create, update, delete)
- **parts-*** (access, create, update, delete)
- **parts-stock-*** (access, in, out)
- **purchases-*** (access, create)
- **parts-sales-*** (access, create)

## 📝 Next Steps untuk Development

### 1. Buat React Views (Priority)

Buat file-file berikut di `resources/js/Pages/Dashboard/`:

```
ServiceCategories/
  ├── Index.jsx
  ├── Create.jsx
  └── Edit.jsx

PartCategories/
  ├── Index.jsx
  ├── Create.jsx
  └── Edit.jsx

Services/
  ├── Index.jsx
  ├── Create.jsx
  └── Edit.jsx
```

### 2. Contoh Component ServiceCategories/Index.jsx

```jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ categories, filters }) {
    return (
        <AuthenticatedLayout>
            <Head title="Service Categories" />
            
            <div className="p-6">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold">Service Categories</h1>
                    <Link
                        href={route('service-categories.create')}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Add Category
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Description</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data.map((category) => (
                                <tr key={category.id} className="border-t">
                                    <td className="px-6 py-4">{category.name}</td>
                                    <td className="px-6 py-4">{category.description}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Link
                                            href={route('service-categories.edit', category.id)}
                                            className="text-blue-600 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this category?')) {
                                                    router.delete(route('service-categories.destroy', category.id));
                                                }
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

### 3. Test Endpoints via Tinker

```php
php artisan tinker

// Test service categories
\App\Models\ServiceCategory::all();

// Test parts dengan category
\App\Models\Part::with('category')->get();

// Test services dengan category
\App\Models\Service::with('category')->get();

// Test create service order
$so = \App\Models\ServiceOrder::create([
    'order_number' => 'SO-TEST001',
    'customer_id' => 1,
    'vehicle_id' => 1,
    'mechanic_id' => 1,
    'status' => 'pending',
    'total' => 200000,
]);
```

### 4. Update Existing Features

Update controller yang sudah ada untuk menggunakan kategori:

**PartController.php** - Tambahkan loading categories:
```php
public function index()
{
    $parts = Part::with(['category', 'supplier'])->paginate(15);
    $categories = PartCategory::orderBy('name')->get();
    
    return Inertia::render('Dashboard/Parts/Index', [
        'parts' => $parts,
        'categories' => $categories,
    ]);
}
```

**ServiceOrderController.php** - Load services dengan kategori:
```php
public function create()
{
    return Inertia::render('Dashboard/ServiceOrders/Create', [
        'services' => Service::with('category')->active()->get(),
        'mechanics' => Mechanic::active()->get(),
        // ...
    ]);
}
```

## 🔧 Maintenance Commands

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Re-seed jika perlu
php artisan db:seed --class=ServiceCategorySeeder
php artisan db:seed --class=PartCategorySeeder
php artisan db:seed --class=ServiceSeeder

# Check routes
php artisan route:list --path=service
php artisan route:list --path=part

# Assign permissions
php artisan db:seed --class=AssignWorkshopPermissionsToAdminSeeder
```

## 📚 Database Schema

### Customers (Enhanced)
- phone, gender, birth_date, identity_type, identity_number, city, postal_code

### Vehicles (Enhanced)
- engine_type, transmission_type, color, cylinder_volume
- last_service_date, next_service_date, features

### Mechanics (Enhanced)
- status, email, specialization, hourly_rate, commission_percentage, certification

### Services (Enhanced)
- service_category_id, complexity_level, required_tools, status, deleted_at

### Parts (Enhanced)
- part_category_id, unit_measure, reorder_level, status, deleted_at

### Service Orders (Enhanced)
- actual_start_at, actual_finish_at, labor_cost, material_cost, warranty_period, deleted_at

## 🎯 Feature Checklist

- ✅ Database migrations lengkap
- ✅ Models dengan relasi & scopes
- ✅ Controllers CRUD lengkap
- ✅ Routes terintegrasi
- ✅ Permissions configured
- ✅ Sample data seeded
- ⏳ React views (TODO)
- ⏳ Dashboard analytics (TODO)
- ⏳ Report generation (TODO)

## 💡 Tips Development

1. **Gunakan Scopes** - Model sudah dilengkapi scopes seperti `active()`, `lowStock()`, `pending()`
2. **SoftDeletes** - Service, Part, ServiceOrder menggunakan soft deletes
3. **JSON Fields** - Specialization, certification, features, required_tools adalah JSON
4. **Permissions** - Setiap route sudah dilindungi dengan permission middleware
5. **Relations** - Semua model sudah punya relasi lengkap, gunakan eager loading

Sistem siap untuk development lebih lanjut! 🚀
