<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddSupplierPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'suppliers-access',
            'suppliers-create',
            'suppliers-update',
            'suppliers-delete',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }
    }
}
