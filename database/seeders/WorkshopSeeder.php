<?php

namespace Database\Seeders;

use App\Models\Mechanic;
use App\Models\Service;
use App\Models\Part;
use App\Models\Vehicle;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class WorkshopSeeder extends Seeder
{
    public function run()
    {
        // Mechanics
        Mechanic::firstOrCreate(['employee_number' => 'M-001'], ['name' => 'Budi', 'phone' => '0811111111']);
        Mechanic::firstOrCreate(['employee_number' => 'M-002'], ['name' => 'Andi', 'phone' => '0822222222']);

        // Services
        Service::firstOrCreate(['code' => 'SVC-OLI'], ['title' => 'Ganti Oli', 'description' => 'Ganti oli mesin', 'est_time_minutes' => 30, 'price' => 50000]);
        Service::firstOrCreate(['code' => 'SVC-TUNE'], ['title' => 'Tune-Up', 'description' => 'Tune-up mesin', 'est_time_minutes' => 60, 'price' => 100000]);

        // Parts
        Part::firstOrCreate(['part_number' => 'OIL-0001'], ['name' => 'Oli 1L', 'stock' => 50, 'minimal_stock' => 15, 'rack_location' => 'B1']);
        Part::firstOrCreate(['part_number' => 'BRK-0006'], ['name' => 'Kampas Rem', 'stock' => 20, 'minimal_stock' => 6, 'rack_location' => 'F5']);

        // Vehicles - sample for existing customers if any
        $customer = Customer::first();
        if ($customer) {
            Vehicle::firstOrCreate(['plate_number' => 'B 1234 AB'], ['customer_id' => $customer->id, 'brand' => 'Yamaha', 'model' => 'Vixion', 'year' => 2019]);
        }
    }
}
