<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class AddVoucherPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'vouchers-access',
            'vouchers-create',
            'vouchers-edit',
            'vouchers-delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }
}
