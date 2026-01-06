<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Tune Up & Maintenance',
                'description' => 'Perawatan berkala dan tune up motor',
                'sort_order' => 1,
            ],
            [
                'name' => 'Engine Service',
                'description' => 'Servis mesin dan komponen mesin',
                'sort_order' => 2,
            ],
            [
                'name' => 'Transmission & Clutch',
                'description' => 'Servis transmisi dan kopling',
                'sort_order' => 3,
            ],
            [
                'name' => 'Electrical & Battery',
                'description' => 'Servis listrik dan aki',
                'sort_order' => 4,
            ],
            [
                'name' => 'Brake System',
                'description' => 'Servis rem dan sistem pengereman',
                'sort_order' => 5,
            ],
            [
                'name' => 'Suspension & Chassis',
                'description' => 'Servis suspensi dan rangka',
                'sort_order' => 6,
            ],
            [
                'name' => 'Body & Painting',
                'description' => 'Servis body dan pengecatan',
                'sort_order' => 7,
            ],
            [
                'name' => 'Wheel & Tire',
                'description' => 'Servis roda dan ban',
                'sort_order' => 8,
            ],
            [
                'name' => 'Diagnostics',
                'description' => 'Pemeriksaan dan diagnostik',
                'sort_order' => 9,
            ],
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
