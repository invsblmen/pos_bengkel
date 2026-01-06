<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // Tune Up & Maintenance
            [
                'code' => 'SRV-001',
                'title' => 'Ganti Oli & Filter',
                'description' => 'Ganti oli mesin dan filter oli',
                'est_time_minutes' => 30,
                'complexity_level' => 'easy',
                'price' => 100000,
                'service_category_id' => 1,
            ],
            [
                'code' => 'SRV-002',
                'title' => 'Busi & Pembersihan Filter Udara',
                'description' => 'Ganti busi dan pembersihan filter udara',
                'est_time_minutes' => 45,
                'complexity_level' => 'easy',
                'price' => 75000,
                'service_category_id' => 1,
            ],
            [
                'code' => 'SRV-003',
                'title' => 'Tune Up Major',
                'description' => 'Tune up lengkap (oli, filter, busi, pembersihan)',
                'est_time_minutes' => 90,
                'complexity_level' => 'medium',
                'price' => 200000,
                'service_category_id' => 1,
            ],

            // Engine Service
            [
                'code' => 'SRV-004',
                'title' => 'Overhaul Mesin',
                'description' => 'Overhaul mesin termasuk pembongkaran dan perakitan',
                'est_time_minutes' => 480,
                'complexity_level' => 'hard',
                'price' => 1500000,
                'service_category_id' => 2,
            ],
            [
                'code' => 'SRV-005',
                'title' => 'Perbaikan Head Silinder',
                'description' => 'Perbaikan dan pengelim head silinder',
                'est_time_minutes' => 240,
                'complexity_level' => 'hard',
                'price' => 800000,
                'service_category_id' => 2,
            ],

            // Transmission & Clutch
            [
                'code' => 'SRV-006',
                'title' => 'Perbaikan Transmisi',
                'description' => 'Perbaikan transmisi manual atau otomatis',
                'est_time_minutes' => 180,
                'complexity_level' => 'hard',
                'price' => 500000,
                'service_category_id' => 3,
            ],
            [
                'code' => 'SRV-007',
                'title' => 'Setel Kampas Kopling',
                'description' => 'Setel dan perbaikan kopling',
                'est_time_minutes' => 60,
                'complexity_level' => 'medium',
                'price' => 150000,
                'service_category_id' => 3,
            ],

            // Electrical & Battery
            [
                'code' => 'SRV-008',
                'title' => 'Cek & Servis Aki',
                'description' => 'Pemeriksaan dan servis aki motor',
                'est_time_minutes' => 45,
                'complexity_level' => 'easy',
                'price' => 75000,
                'service_category_id' => 4,
            ],
            [
                'code' => 'SRV-009',
                'title' => 'Perbaikan Sistem Kelistrikan',
                'description' => 'Perbaikan sistem kelistrikan motor',
                'est_time_minutes' => 120,
                'complexity_level' => 'medium',
                'price' => 250000,
                'service_category_id' => 4,
            ],

            // Brake System
            [
                'code' => 'SRV-010',
                'title' => 'Ganti Kampas Rem',
                'description' => 'Ganti kampas rem depan atau belakang',
                'est_time_minutes' => 45,
                'complexity_level' => 'easy',
                'price' => 125000,
                'service_category_id' => 5,
            ],
            [
                'code' => 'SRV-011',
                'title' => 'Servis Sistem Rem Komplit',
                'description' => 'Servis lengkap sistem rem (bah, rotor, selang)',
                'est_time_minutes' => 120,
                'complexity_level' => 'medium',
                'price' => 350000,
                'service_category_id' => 5,
            ],

            // Suspension
            [
                'code' => 'SRV-012',
                'title' => 'Setel Suspensi',
                'description' => 'Penyetelan suspensi depan dan belakang',
                'est_time_minutes' => 90,
                'complexity_level' => 'medium',
                'price' => 175000,
                'service_category_id' => 6,
            ],

            // Wheel & Tire
            [
                'code' => 'SRV-013',
                'title' => 'Ganti Ban',
                'description' => 'Ganti ban motor',
                'est_time_minutes' => 60,
                'complexity_level' => 'easy',
                'price' => 200000,
                'service_category_id' => 8,
            ],
            [
                'code' => 'SRV-014',
                'title' => 'Tambal Ban Dalam',
                'description' => 'Tambal atau perbaikan ban dalam',
                'est_time_minutes' => 30,
                'complexity_level' => 'easy',
                'price' => 50000,
                'service_category_id' => 8,
            ],

            // Diagnostics
            [
                'code' => 'SRV-015',
                'title' => 'Diagnostik Komputer',
                'description' => 'Pemeriksaan menggunakan komputer diagnostik',
                'est_time_minutes' => 60,
                'complexity_level' => 'medium',
                'price' => 150000,
                'service_category_id' => 9,
            ],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['code' => $service['code']],
                $service
            );
        }
    }
}
