<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AddMissingPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Assign all permissions to super-admin role
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $allPermissions = Permission::all();
            $superAdmin->syncPermissions($allPermissions);
            $this->command->info('✅ All permissions assigned to super-admin role!');
        }
    }
}
