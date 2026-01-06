<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$admin = Spatie\Permission\Models\Role::where('name', 'admin')->first();
if ($admin) {
    $admin->givePermissionTo(['part-purchase-orders-access', 'part-purchase-orders-create', 'part-purchase-orders-update', 'part-purchase-orders-delete']);
    echo 'Admin role updated' . PHP_EOL;
}

$user = App\Models\User::find(1);
if ($user) {
    $user->givePermissionTo(['part-purchase-orders-access', 'part-purchase-orders-create', 'part-purchase-orders-update', 'part-purchase-orders-delete']);
    echo $user->email . ' - Permissions granted' . PHP_EOL;
}
