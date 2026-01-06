<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create permission
$permission = Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'part-stock-history-access']);
echo "✓ Permission 'part-stock-history-access' created/exists" . PHP_EOL;

// Assign to super-admin
$superAdmin = Spatie\Permission\Models\Role::where('name', 'super-admin')->first();
if ($superAdmin) {
    $superAdmin->givePermissionTo('part-stock-history-access');
    echo "✓ Permission assigned to super-admin role" . PHP_EOL;
}

echo PHP_EOL . "Done!" . PHP_EOL;
