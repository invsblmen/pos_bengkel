<?php

namespace Database\Seeders;

use App\Models\PartCategory;
use Illuminate\Database\Seeder;

class PartCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Engine Parts',
                'description' => 'Suku cadang mesin',
                'sort_order' => 1,
            ],
            [
                'name' => 'Transmission & Clutch',
                'description' => 'Suku cadang transmisi dan kopling',
                'sort_order' => 2,
            ],
            [
                'name' => 'Electrical Parts',
                'description' => 'Suku cadang listrik',
                'sort_order' => 3,
            ],
            [
                'name' => 'Brake Parts',
                'description' => 'Suku cadang rem',
                'sort_order' => 4,
            ],
            [
                'name' => 'Suspension Parts',
                'description' => 'Suku cadang suspensi',
                'sort_order' => 5,
            ],
            [
                'name' => 'Wheel & Tire',
                'description' => 'Roda dan ban',
                'sort_order' => 6,
            ],
            [
                'name' => 'Filters & Fluids',
                'description' => 'Filter dan cairan servis',
                'sort_order' => 7,
            ],
            [
                'name' => 'Fasteners & Hardware',
                'description' => 'Baut, mur, dan hardware',
                'sort_order' => 8,
            ],
            [
                'name' => 'Accessories',
                'description' => 'Aksesori motor',
                'sort_order' => 9,
            ],
        ];

        foreach ($categories as $category) {
            PartCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
