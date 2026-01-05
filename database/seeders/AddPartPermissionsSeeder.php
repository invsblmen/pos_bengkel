<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddPartPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'parts-access',
            'parts-create',
            'parts-update',
            'parts-delete',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }
    }
}
