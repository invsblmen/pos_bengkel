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
        Mechanic::create(['name' => 'Budi', 'phone' => '0811111111', 'employee_number' => 'M-001']);
        Mechanic::create(['name' => 'Andi', 'phone' => '0822222222', 'employee_number' => 'M-002']);

        // Services
        Service::create(['code' => 'SVC-OLI', 'title' => 'Ganti Oli', 'description' => 'Ganti oli mesin', 'est_time_minutes' => 30, 'price' => 50000]);
        Service::create(['code' => 'SVC-TUNE', 'title' => 'Tune-Up', 'description' => 'Tune-up mesin', 'est_time_minutes' => 60, 'price' => 100000]);

        // Parts
        Part::create(['sku' => 'PRT-OLI-1L', 'name' => 'Oli 1L', 'buy_price' => 20000, 'sell_price' => 35000, 'stock' => 50]);
        Part::create(['sku' => 'PRT-KAMPAS', 'name' => 'Kampas Rem', 'buy_price' => 30000, 'sell_price' => 55000, 'stock' => 20]);

        // Vehicles - sample for existing customers if any
        $customer = Customer::first();
        if ($customer) {
            Vehicle::create(['customer_id' => $customer->id, 'plate_number' => 'B 1234 AB', 'brand' => 'Yamaha', 'model' => 'Vixion', 'year' => 2019, 'km' => 12000]);
        }
    }
}
