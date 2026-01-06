<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Check available roles
$roles = Spatie\Permission\Models\Role::pluck('name')->toArray();
echo "Available roles: " . implode(', ', $roles) . PHP_EOL . PHP_EOL;

// Remove from admin if exists
$admin = Spatie\Permission\Models\Role::where('name', 'admin')->first();
if ($admin) {
    try {
        $admin->revokePermissionTo(['part-purchase-orders-access', 'part-purchase-orders-create', 'part-purchase-orders-update', 'part-purchase-orders-delete']);
        echo "Removed PO permissions from admin role" . PHP_EOL;
    } catch (\Exception $e) {
        echo "Admin role didn't have PO permissions (OK)" . PHP_EOL;
    }
}

// Assign to super admin
$superAdmin = Spatie\Permission\Models\Role::where('name', 'super-admin')->first();
if ($superAdmin) {
    $superAdmin->givePermissionTo(['part-purchase-orders-access', 'part-purchase-orders-create', 'part-purchase-orders-update', 'part-purchase-orders-delete']);
    echo "✓ Super-admin role updated with PO permissions" . PHP_EOL;
} else {
    echo "✗ Super-admin role not found!" . PHP_EOL;
}

// Also assign other sparepart permissions to super admin if not already
if ($superAdmin) {
    $superAdmin->givePermissionTo([
        'part-purchases-access', 'part-purchases-create', 'part-purchases-update', 'part-purchases-delete',
        'part-sales-orders-access', 'part-sales-orders-create', 'part-sales-orders-update', 'part-sales-orders-delete'
    ]);
    echo "✓ All sparepart permissions assigned to super admin" . PHP_EOL;
}

echo PHP_EOL . "Done!" . PHP_EOL;
