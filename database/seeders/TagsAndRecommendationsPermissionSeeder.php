<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TagsAndRecommendationsPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Tags permissions
            ['name' => 'tags-access', 'guard_name' => 'web'],
            ['name' => 'tags-create', 'guard_name' => 'web'],
            ['name' => 'tags-update', 'guard_name' => 'web'],
            ['name' => 'tags-delete', 'guard_name' => 'web'],

            // Vehicle recommendations permissions
            ['name' => 'vehicle-recommendations-access', 'guard_name' => 'web'],
            ['name' => 'maintenance-schedule-access', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }

        // Assign all permissions to super-admin role
        $superAdmin = Role::where('name', 'super-admin')->first();
        if ($superAdmin) {
            $allPermissions = Permission::all();
            $superAdmin->syncPermissions($allPermissions);
            $this->command->info('✅ All permissions synced to super-admin role!');
        }

        $this->command->info('✅ Tags and Recommendations permissions created successfully!');
    }
}
