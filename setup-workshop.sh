#!/bin/bash
# Script untuk menjalankan setup lengkap sistem POS bengkel motor

echo "=== POS Bengkel Motor - Setup Script ==="
echo ""

# 1. Run migrations
echo "1. Menjalankan migrations..."
php artisan migrate

# 2. Run seeders
echo "2. Menjalankan seeders..."
php artisan db:seed --class=ServiceCategorySeeder
php artisan db:seed --class=PartCategorySeeder
php artisan db:seed --class=ServiceSeeder

# 3. Setup permissions
echo "3. Setup permissions untuk workshop..."
php artisan tinker << 'EOF'
use App\Models\Role;
use App\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

// Clear cache
app()[PermissionRegistrar::class]->forgetCachedPermissions();

// Workshop-specific permissions
$permissions = [
    // Service Categories
    ['name' => 'service-categories-access', 'display_name' => 'Access Service Categories'],
    ['name' => 'service-categories-create', 'display_name' => 'Create Service Categories'],
    ['name' => 'service-categories-edit', 'display_name' => 'Edit Service Categories'],
    ['name' => 'service-categories-delete', 'display_name' => 'Delete Service Categories'],

    // Part Categories
    ['name' => 'part-categories-access', 'display_name' => 'Access Part Categories'],
    ['name' => 'part-categories-create', 'display_name' => 'Create Part Categories'],
    ['name' => 'part-categories-edit', 'display_name' => 'Edit Part Categories'],
    ['name' => 'part-categories-delete', 'display_name' => 'Delete Part Categories'],

    // Services
    ['name' => 'services-access', 'display_name' => 'Access Services'],
    ['name' => 'services-create', 'display_name' => 'Create Services'],
    ['name' => 'services-edit', 'display_name' => 'Edit Services'],
    ['name' => 'services-delete', 'display_name' => 'Delete Services'],

    // Service Orders
    ['name' => 'service-orders-access', 'display_name' => 'Access Service Orders'],
    ['name' => 'service-orders-create', 'display_name' => 'Create Service Orders'],
    ['name' => 'service-orders-update', 'display_name' => 'Update Service Orders'],
    ['name' => 'service-orders-delete', 'display_name' => 'Delete Service Orders'],

    // Appointments
    ['name' => 'appointments-access', 'display_name' => 'Access Appointments'],
    ['name' => 'appointments-create', 'display_name' => 'Create Appointments'],
    ['name' => 'appointments-update', 'display_name' => 'Update Appointments'],
    ['name' => 'appointments-delete', 'display_name' => 'Delete Appointments'],
];

foreach ($permissions as $perm) {
    Permission::firstOrCreate(['name' => $perm['name']], $perm);
}

echo "Permissions created successfully!";
EOF

echo ""
echo "=== Setup Complete! ==="
echo "Sistem POS Bengkel Motor siap digunakan."
