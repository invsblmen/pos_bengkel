<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class WorkshopPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Workshop-specific permissions
        $permissions = [
            // Service Categories
            ['name' => 'service-categories-access', 'guard_name' => 'web'],
            ['name' => 'service-categories-create', 'guard_name' => 'web'],
            ['name' => 'service-categories-edit', 'guard_name' => 'web'],
            ['name' => 'service-categories-delete', 'guard_name' => 'web'],

            // Part Categories
            ['name' => 'part-categories-access', 'guard_name' => 'web'],
            ['name' => 'part-categories-create', 'guard_name' => 'web'],
            ['name' => 'part-categories-edit', 'guard_name' => 'web'],
            ['name' => 'part-categories-delete', 'guard_name' => 'web'],

            // Services
            ['name' => 'services-access', 'guard_name' => 'web'],
            ['name' => 'services-create', 'guard_name' => 'web'],
            ['name' => 'services-edit', 'guard_name' => 'web'],
            ['name' => 'services-delete', 'guard_name' => 'web'],

            // Service Orders (ensure these exist)
            ['name' => 'service-orders-access', 'guard_name' => 'web'],
            ['name' => 'service-orders-create', 'guard_name' => 'web'],
            ['name' => 'service-orders-update', 'guard_name' => 'web'],
            ['name' => 'service-orders-delete', 'guard_name' => 'web'],

            // Appointments (ensure these exist)
            ['name' => 'appointments-access', 'guard_name' => 'web'],
            ['name' => 'appointments-create', 'guard_name' => 'web'],
            ['name' => 'appointments-update', 'guard_name' => 'web'],
            ['name' => 'appointments-delete', 'guard_name' => 'web'],

            // Mechanics (ensure these exist)
            ['name' => 'mechanics-access', 'guard_name' => 'web'],
            ['name' => 'mechanics-create', 'guard_name' => 'web'],
            ['name' => 'mechanics-update', 'guard_name' => 'web'],
            ['name' => 'mechanics-delete', 'guard_name' => 'web'],

            // Suppliers (ensure these exist)
            ['name' => 'suppliers-access', 'guard_name' => 'web'],
            ['name' => 'suppliers-create', 'guard_name' => 'web'],
            ['name' => 'suppliers-update', 'guard_name' => 'web'],
            ['name' => 'suppliers-delete', 'guard_name' => 'web'],

            // Parts (ensure these exist)
            ['name' => 'parts-access', 'guard_name' => 'web'],
            ['name' => 'parts-create', 'guard_name' => 'web'],
            ['name' => 'parts-update', 'guard_name' => 'web'],
            ['name' => 'parts-delete', 'guard_name' => 'web'],

            // Parts Stock
            ['name' => 'parts-stock-access', 'guard_name' => 'web'],
            ['name' => 'parts-stock-in', 'guard_name' => 'web'],
            ['name' => 'parts-stock-out', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name'], 'guard_name' => $permission['guard_name']],
                $permission
            );
        }

        $this->command->info('Workshop permissions created successfully!');
    }
}
