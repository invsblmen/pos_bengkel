<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UpdatePermissionsSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            'services-access',
            'services-create',
            'services-edit',
            'services-delete',
            'service-categories-access',
            'service-categories-create',
            'service-categories-edit',
            'service-categories-delete',
            'part-categories-access',
            'part-categories-create',
            'part-categories-edit',
            'part-categories-delete',
            'parts-stock-in',
            'parts-stock-out',
            'parts-stock-access',
            'parts-sales-access',
            'parts-sales-create',
            'parts-sales-edit',
            'parts-sales-delete',
            'vehicles-access',
            'vehicles-create',
            'vehicles-edit',
            'vehicles-delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign to admin role
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        // Assign to super-admin role
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }

        $this->command->info('Permissions created and assigned successfully!');
    }
}
