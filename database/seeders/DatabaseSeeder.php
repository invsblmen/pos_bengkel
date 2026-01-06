<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            \Database\Seeders\AddPartPermissionsSeeder::class,
            \Database\Seeders\AddPartStockPermissionsSeeder::class,
            \Database\Seeders\AddPurchasePermissionsSeeder::class,
            \Database\Seeders\AddSalesPermissionsSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            PaymentSettingSeeder::class,
            SampleDataSeeder::class,
            WorkshopSeeder::class,
            SupplierSeeder::class,
            PartSeeder::class,
        ]);
    }
}
