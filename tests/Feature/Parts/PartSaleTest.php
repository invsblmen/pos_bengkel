<?php

namespace Tests\Feature\Parts;

use App\Models\Part;
use App\Models\PartSale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PartSaleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'parts-sales-create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'parts-sales-access', 'guard_name' => 'web']);
    }

    public function test_user_can_create_sale_and_stock_out_is_recorded(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('parts-sales-create');

        $part = Part::create(['name' => 'Part A', 'stock' => 10]);

        $payload = [
            'notes' => 'Penjualan awal',
            'items' => [
                [
                    'part_id' => $part->id,
                    'qty' => 3,
                    'unit_price' => 15000,
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('parts.sales.store'), $payload);

        $response->assertRedirect(route('parts.sales.index'));

        $sale = PartSale::latest('id')->first();
        $this->assertNotNull($sale);
        $this->assertSame('Penjualan awal', $sale->notes);
        // total should equal qty * unit_price (3 * 15000 = 45000)
        $this->assertSame(45000, $sale->total);

        $this->assertDatabaseHas('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'sale',
            'qty' => 3,
            'reference_type' => \App\Models\PartSale::class,
            'reference_id' => $sale->id,
        ]);

        $this->assertSame(7, $part->fresh()->stock);
    }

    public function test_cannot_create_sale_if_insufficient_stock(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('parts-sales-create');

        $part = Part::create(['name' => 'Part B', 'stock' => 2]);

        $payload = [
            'notes' => 'Penjualan gagal',
            'items' => [
                [
                    'part_id' => $part->id,
                    'qty' => 5,
                    'unit_price' => 15000,
                ],
            ],
        ];

        // Use JSON request to receive 422 JSON validation response
        $response = $this->actingAs($user)->postJson(route('parts.sales.store'), $payload);

        // Controller now returns 422 validation errors when stock is insufficient
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('items');

        $this->assertDatabaseMissing('part_sales', [
            'notes' => 'Penjualan gagal',
        ]);

        $this->assertDatabaseMissing('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'sale',
        ]);

        $this->assertSame(2, $part->fresh()->stock);
    }
}
