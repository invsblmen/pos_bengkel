<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddPartStockPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'parts-stock-access',
            'parts-stock-in',
            'parts-stock-out',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }
    }
}
