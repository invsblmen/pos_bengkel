<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AssignWorkshopPermissionsToAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Cari role admin
        $admin = Role::where('name', 'admin')->first();

        if (!$admin) {
            $this->command->warn('Role admin tidak ditemukan. Membuat role admin...');
            $admin = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        }

        // List semua permissions workshop
        $workshopPermissions = [
            // Service Categories
            'service-categories-access',
            'service-categories-create',
            'service-categories-edit',
            'service-categories-delete',

            // Part Categories
            'part-categories-access',
            'part-categories-create',
            'part-categories-edit',
            'part-categories-delete',

            // Services
            'services-access',
            'services-create',
            'services-edit',
            'services-delete',

            // Service Orders
            'service-orders-access',
            'service-orders-create',
            'service-orders-update',
            'service-orders-delete',

            // Appointments
            'appointments-access',
            'appointments-create',
            'appointments-update',
            'appointments-delete',

            // Mechanics
            'mechanics-access',
            'mechanics-create',
            'mechanics-update',
            'mechanics-delete',

            // Suppliers
            'suppliers-access',
            'suppliers-create',
            'suppliers-update',
            'suppliers-delete',

            // Parts
            'parts-access',
            'parts-create',
            'parts-update',
            'parts-delete',

            // Parts Stock
            'parts-stock-access',
            'parts-stock-in',
            'parts-stock-out',
        ];

        $assignedCount = 0;
        $existingCount = 0;

        foreach ($workshopPermissions as $permissionName) {
            $permission = Permission::where('name', $permissionName)->first();

            if ($permission) {
                if (!$admin->hasPermissionTo($permission)) {
                    $admin->givePermissionTo($permission);
                    $assignedCount++;
                } else {
                    $existingCount++;
                }
            } else {
                $this->command->warn("Permission tidak ditemukan: {$permissionName}");
            }
        }

        $this->command->info("✓ {$assignedCount} permissions baru di-assign ke role admin");
        $this->command->info("✓ {$existingCount} permissions sudah ada sebelumnya");
        $this->command->info("Total permissions admin sekarang: " . $admin->permissions->count());
    }
}
