<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddSalesPermissionsSeeder extends Seeder
{
    public function run()
    {
        $perms = [
            'parts-sales-access',
            'parts-sales-create',
            'parts-sales-view',
        ];

        foreach ($perms as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
        }
    }
}
