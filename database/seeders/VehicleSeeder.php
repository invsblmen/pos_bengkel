<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class VehicleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Vehicle::truncate();
        Schema::enableForeignKeyConstraints();

        $this->command->info('Seeding vehicles...');

        // Get all customers
        $customers = Customer::all();

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Please run SampleDataSeeder first.');
            return;
        }

        // Realistic motorcycle data for Indonesian market
        $motorcycles = [
            // Honda Motors
            [
                'brand' => 'Honda',
                'model' => 'Beat Street',
                'year' => 2023,
                'engine_type' => '4-Stroke eSP',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '110cc',
                'color' => 'Merah Hitam',
                'features' => ['ISS (Idling Stop System)', 'CBS', 'LED Headlight'],
            ],
            [
                'brand' => 'Honda',
                'model' => 'Vario 160',
                'year' => 2024,
                'engine_type' => '4-Stroke eSP+',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '160cc',
                'color' => 'Putih',
                'features' => ['Smart Key System', 'Full LED', 'USB Charger', 'ISS'],
            ],
            [
                'brand' => 'Honda',
                'model' => 'PCX 160',
                'year' => 2023,
                'engine_type' => '4-Stroke eSP+',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '160cc',
                'color' => 'Abu-abu',
                'features' => ['Smart Key', 'ABS', 'TFT Display', 'USB Charger'],
            ],
            [
                'brand' => 'Honda',
                'model' => 'Scoopy',
                'year' => 2022,
                'engine_type' => '4-Stroke eSP',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '110cc',
                'color' => 'Pink',
                'features' => ['CBS', 'LED Headlight', 'Smart Key System'],
            ],
            [
                'brand' => 'Honda',
                'model' => 'CB150R Streetfire',
                'year' => 2023,
                'engine_type' => '4-Stroke DOHC',
                'transmission_type' => 'manual',
                'cylinder_volume' => '150cc',
                'color' => 'Hitam Merah',
                'features' => ['USD Fork', 'ABS', 'Full LED', 'Digital Speedometer'],
            ],

            // Yamaha Motors
            [
                'brand' => 'Yamaha',
                'model' => 'NMAX 155 Connected',
                'year' => 2024,
                'engine_type' => '4-Stroke Blue Core',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '155cc',
                'color' => 'Biru',
                'features' => ['Y-Connect', 'ABS', 'Smart Key', 'TFT Display', 'USB Charger'],
            ],
            [
                'brand' => 'Yamaha',
                'model' => 'Aerox 155 Connected',
                'year' => 2023,
                'engine_type' => '4-Stroke VVA',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '155cc',
                'color' => 'Hijau',
                'features' => ['Y-Connect', 'ABS', 'Traction Control', 'Smart Key'],
            ],
            [
                'brand' => 'Yamaha',
                'model' => 'Mio M3 125',
                'year' => 2022,
                'engine_type' => '4-Stroke Blue Core',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '125cc',
                'color' => 'Kuning',
                'features' => ['Stop & Start System', 'LED Headlight'],
            ],
            [
                'brand' => 'Yamaha',
                'model' => 'Freego S',
                'year' => 2023,
                'engine_type' => '4-Stroke Blue Core',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '125cc',
                'color' => 'Putih Biru',
                'features' => ['Smart Key System', 'LED Headlight', 'USB Charger'],
            ],
            [
                'brand' => 'Yamaha',
                'model' => 'R15 V4',
                'year' => 2024,
                'engine_type' => '4-Stroke VVA',
                'transmission_type' => 'manual',
                'cylinder_volume' => '155cc',
                'color' => 'Racing Blue',
                'features' => ['Quick Shifter', 'USD Fork', 'ABS', 'Traction Control', 'TFT Display'],
            ],

            // Suzuki Motors
            [
                'brand' => 'Suzuki',
                'model' => 'Nex II',
                'year' => 2022,
                'engine_type' => '4-Stroke SOHC',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '115cc',
                'color' => 'Merah',
                'features' => ['CBS', 'LED Headlight'],
            ],
            [
                'brand' => 'Suzuki',
                'model' => 'Address Playful',
                'year' => 2023,
                'engine_type' => '4-Stroke SOHC',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '110cc',
                'color' => 'Biru Muda',
                'features' => ['CBS', 'LED Position Light', 'USB Charger'],
            ],
            [
                'brand' => 'Suzuki',
                'model' => 'Burgman Street',
                'year' => 2023,
                'engine_type' => '4-Stroke SOHC',
                'transmission_type' => 'automatic',
                'cylinder_volume' => '125cc',
                'color' => 'Hitam',
                'features' => ['CBS', 'Full LED', 'USB Charger', 'Digital Speedometer'],
            ],
            [
                'brand' => 'Suzuki',
                'model' => 'GSX-R150',
                'year' => 2023,
                'engine_type' => '4-Stroke DOHC',
                'transmission_type' => 'manual',
                'cylinder_volume' => '150cc',
                'color' => 'MotoGP Edition',
                'features' => ['USD Fork', 'ABS', 'Full Fairing', 'Digital Speedometer'],
            ],

            // Kawasaki Motors
            [
                'brand' => 'Kawasaki',
                'model' => 'Ninja 250SL',
                'year' => 2022,
                'engine_type' => '4-Stroke DOHC',
                'transmission_type' => 'manual',
                'cylinder_volume' => '250cc',
                'color' => 'Hijau KRT',
                'features' => ['Full Fairing', 'Digital Speedometer', 'Monoshock'],
            ],
            [
                'brand' => 'Kawasaki',
                'model' => 'W175',
                'year' => 2023,
                'engine_type' => '4-Stroke SOHC',
                'transmission_type' => 'manual',
                'cylinder_volume' => '175cc',
                'color' => 'Hitam Chrome',
                'features' => ['Classic Design', 'Dual Tone Seat', 'Chrome Parts'],
            ],
        ];

        // Regional codes for Indonesian license plates
        $regions = ['B', 'D', 'E', 'F', 'L', 'N', 'AB', 'AD', 'AG'];

        foreach ($motorcycles as $index => $motorcycle) {
            // Assign to random customer
            $customer = $customers->random();

            // Generate realistic plate number (e.g., B 1234 XYZ)
            $region = $regions[array_rand($regions)];
            $number = rand(1000, 9999);
            $letters = chr(rand(65, 90)) . chr(rand(65, 90)) . (rand(0, 1) ? chr(rand(65, 90)) : '');
            $plateNumber = "{$region} {$number} {$letters}";

            // Generate chassis and engine numbers
            $chassisNumber = 'MH1' . strtoupper(substr($motorcycle['brand'], 0, 2)) . rand(10000000, 99999999);
            $engineNumber = strtoupper(substr($motorcycle['model'], 0, 3)) . rand(1000000, 9999999);

            // Generate STNK dates
            $registrationDate = Carbon::now()->subMonths(rand(6, 36));
            $stnkExpiryDate = (clone $registrationDate)->addYear();

            Vehicle::create([
                'customer_id' => $customer->id,
                'plate_number' => $plateNumber,
                'brand' => $motorcycle['brand'],
                'model' => $motorcycle['model'],
                'year' => $motorcycle['year'],
                'manufacture_year' => $motorcycle['year'],
                'engine_type' => $motorcycle['engine_type'],
                'transmission_type' => $motorcycle['transmission_type'],
                'cylinder_volume' => $motorcycle['cylinder_volume'],
                'color' => $motorcycle['color'],
                'features' => $motorcycle['features'], // Laravel will auto-cast to JSON
                'chassis_number' => $chassisNumber,
                'engine_number' => $engineNumber,
                'registration_number' => 'REG-' . rand(100000, 999999),
                'registration_date' => $registrationDate,
                'stnk_expiry_date' => $stnkExpiryDate,
                'notes' => $this->generateNotes($motorcycle['brand'], $motorcycle['model']),
                'previous_owner' => rand(0, 1) ? null : 'Tuan ' . ['Budi', 'Ahmad', 'Dedi', 'Eko'][rand(0, 3)],
            ]);

            $this->command->info("  Created: {$plateNumber} - {$motorcycle['brand']} {$motorcycle['model']} ({$customer->name})");
        }

        $this->command->info('Vehicles seeding completed! Total: ' . Vehicle::count());
    }

    /**
     * Generate realistic notes for vehicle
     */
    private function generateNotes(string $brand, string $model): ?string
    {
        $notes = [
            "Motor sangat terawat, rutin service berkala",
            "Kondisi prima, baru ganti oli",
            "Velg racing aftermarket, ban baru",
            "Sudah upgrade CDI racing",
            "Knalpot masih standar pabrik",
            null, // Some vehicles might not have notes
            "Body mulus, cat original",
            "Ada sedikit lecet di spatbor kiri",
        ];

        return $notes[array_rand($notes)];
    }
}
