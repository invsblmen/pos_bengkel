<?php

namespace Database\Factories;

use App\Models\Part;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PartFactory extends Factory
{
    protected $model = Part::class;

    public function definition()
    {
        $supplier = Supplier::inRandomOrder()->first();

        return [
            'sku' => strtoupper(Str::random(8)),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'buy_price' => $this->faker->numberBetween(10000, 200000),
            'sell_price' => $this->faker->numberBetween(20000, 350000),
            'stock' => $this->faker->numberBetween(0, 150),
            'supplier_id' => $supplier ? $supplier->id : null,
        ];
    }
}
