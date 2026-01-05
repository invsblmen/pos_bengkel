<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddPurchasePermissionsSeeder extends Seeder
{
    public function run()
    {
        $perms = [
            'purchases-access',
            'purchases-create',
            'purchases-view',
        ];

        foreach ($perms as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
    }
}
