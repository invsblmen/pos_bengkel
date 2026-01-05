<?php

namespace Tests\Feature\Parts;

use App\Models\Part;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'purchases-create', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'purchases-access', 'guard_name' => 'web']);
    }

    public function test_user_can_create_purchase_and_stock_in_is_recorded(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('purchases-create');

        $supplier = Supplier::create(['name' => 'Supplier A']);
        $part = Part::create(['name' => 'Part A', 'stock' => 2]);

        $payload = [
            'supplier_id' => $supplier->id,
            'notes' => 'Pembelian awal',
            'items' => [
                [
                    'part_id' => $part->id,
                    'qty' => 5,
                    'unit_price' => 12000,
                ],
            ],
        ];

        $response = $this->actingAs($user)->post(route('parts.purchases.store'), $payload);

        $response->assertRedirect(route('parts.purchases.index'));

        $purchase = Purchase::latest('id')->first();
        $this->assertNotNull($purchase);
        $this->assertSame($supplier->id, $purchase->supplier_id);
        $this->assertSame('Pembelian awal', $purchase->notes);
        // total should equal qty * unit_price (5 * 12000 = 60000)
        $this->assertSame(60000, $purchase->total);

        $this->assertDatabaseHas('purchase_details', [
            'purchase_id' => $purchase->id,
            'part_id' => $part->id,
            'qty' => 5,
        ]);

        $this->assertDatabaseHas('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'purchase',
            'qty' => 5,
            'supplier_id' => $supplier->id,
            'reference_type' => \App\Models\Purchase::class,
            'reference_id' => $purchase->id,
        ]);

        $this->assertSame(7, $part->fresh()->stock);
    }
}
