<?php

namespace Tests\Feature\Warranty;

use Tests\TestCase;
use App\Models\Part;
use App\Models\PartSale;
use App\Models\PartSaleDetail;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderDetail;
use App\Models\WarrantyRegistration;
use App\Services\WarrantyRegistrationService;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WarrantyRegistrationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected WarrantyRegistrationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(WarrantyRegistrationService::class);
    }

    #[Test]
    public function it_registers_warranty_from_part_sale_detail()
    {
        $part = Part::create([
            'part_number' => 'PRT-001',
            'name' => 'Brake Pad',
            'buy_price' => 50000,
            'sell_price' => 90000,
            'stock' => 10,
            'minimal_stock' => 1,
            'has_warranty' => true,
            'warranty_duration_days' => 30,
        ]);

        $sale = PartSale::create([
            'sale_number' => 'SAL202603280001',
            'sale_date' => now()->toDateString(),
            'subtotal' => 90000,
            'discount_type' => 'none',
            'discount_value' => 0,
            'discount_amount' => 0,
            'tax_type' => 'none',
            'tax_value' => 0,
            'tax_amount' => 0,
            'grand_total' => 90000,
            'paid_amount' => 90000,
            'remaining_amount' => 0,
            'payment_status' => 'paid',
            'status' => 'completed',
        ]);

        $detail = PartSaleDetail::create([
            'part_sale_id' => $sale->id,
            'part_id' => $part->id,
            'quantity' => 1,
            'unit_price' => 90000,
            'subtotal' => 90000,
            'discount_type' => 'none',
            'discount_value' => 0,
            'discount_amount' => 0,
            'final_amount' => 90000,
            'warranty_period_days' => 30,
            'warranty_start_date' => now()->toDateString(),
            'warranty_end_date' => now()->addDays(30)->toDateString(),
        ]);

        $registration = $this->service->registerFromPartSaleDetail($sale, $detail, $part);

        $this->assertNotNull($registration);
        $this->assertDatabaseHas('warranty_registrations', [
            'source_type' => PartSale::class,
            'source_id' => $sale->id,
            'source_detail_id' => $detail->id,
            'warrantable_type' => Part::class,
            'warrantable_id' => $part->id,
            'warranty_period_days' => 30,
            'status' => 'active',
        ]);
    }

    #[Test]
    public function it_registers_warranty_from_service_order_detail()
    {
        $service = Service::create([
            'code' => 'SVC-001',
            'title' => 'Engine Tune Up',
            'price' => 250000,
            'has_warranty' => true,
            'warranty_duration_days' => 14,
        ]);

        $order = ServiceOrder::create([
            'order_number' => 'SO-20260328-001',
            'status' => 'completed',
            'odometer_km' => 12345,
            'labor_cost' => 250000,
            'material_cost' => 0,
            'total' => 250000,
            'discount_type' => 'none',
            'discount_value' => 0,
            'discount_amount' => 0,
            'tax_type' => 'none',
            'tax_value' => 0,
            'tax_amount' => 0,
            'grand_total' => 250000,
            'actual_finish_at' => now(),
        ]);

        $detail = ServiceOrderDetail::create([
            'service_order_id' => $order->id,
            'service_id' => $service->id,
            'qty' => 1,
            'price' => 250000,
            'amount' => 250000,
            'discount_type' => 'none',
            'discount_value' => 0,
            'discount_amount' => 0,
            'final_amount' => 250000,
        ]);

        $registration = $this->service->registerFromServiceOrderDetail($order, $detail);

        $this->assertNotNull($registration);
        $this->assertDatabaseHas('warranty_registrations', [
            'source_type' => ServiceOrder::class,
            'source_id' => $order->id,
            'source_detail_id' => $detail->id,
            'warrantable_type' => Service::class,
            'warrantable_id' => $service->id,
            'warranty_period_days' => 14,
            'status' => 'active',
        ]);
    }
}
