<?php

namespace Tests\Feature\Parts;

use App\Models\Part;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PartStockTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Permission::firstOrCreate(['name' => 'parts-stock-in', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'parts-stock-out', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'parts-stock-access', 'guard_name' => 'web']);
    }

    public function test_user_with_permission_can_store_increases_stock_and_creates_movement(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('parts-stock-in');

        $supplier = Supplier::create(['name' => 'Test Supplier']);
        $part = Part::create(['name' => 'Test Part', 'stock' => 5]);

        $response = $this->actingAs($user)->post(route('parts.stock.in.store'), [
            'part_id' => $part->id,
            'qty' => 3,
            'unit_price' => 15000,
            'supplier_id' => $supplier->id,
            'notes' => 'Pembelian awal',
        ]);

        $response->assertRedirect(route('parts.stock.index'));

        $this->assertDatabaseHas('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'in',
            'qty' => 3,
            'supplier_id' => $supplier->id,
            'notes' => 'Pembelian awal',
        ]);

        $this->assertSame(8, $part->fresh()->stock);
    }

    public function test_user_cannot_store_out_if_insufficient_stock(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('parts-stock-out');

        $part = Part::create(['name' => 'Small Part', 'stock' => 2]);

        $response = $this->actingAs($user)->post(route('parts.stock.out.store'), [
            'part_id' => $part->id,
            'qty' => 5,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'out',
        ]);

        $this->assertSame(2, $part->fresh()->stock);
    }

    public function test_user_can_store_out_and_decrements_stock(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('parts-stock-out');

        $part = Part::create(['name' => 'Used Part', 'stock' => 10]);

        $response = $this->actingAs($user)->post(route('parts.stock.out.store'), [
            'part_id' => $part->id,
            'qty' => 4,
            'notes' => 'Digunakan servis',
        ]);

        $response->assertRedirect(route('parts.stock.index'));

        $this->assertDatabaseHas('part_stock_movements', [
            'part_id' => $part->id,
            'type' => 'out',
            'qty' => 4,
            'notes' => 'Digunakan servis',
        ]);

        $this->assertSame(6, $part->fresh()->stock);
    }
}
