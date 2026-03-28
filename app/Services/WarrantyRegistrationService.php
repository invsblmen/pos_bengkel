<?php

namespace App\Services;

use App\Models\Part;
use App\Models\PartSale;
use App\Models\PartSaleDetail;
use App\Models\Service;
use App\Models\ServiceOrder;
use App\Models\ServiceOrderDetail;
use App\Models\WarrantyRegistration;
use Carbon\Carbon;

class WarrantyRegistrationService
{
    public function registerFromPartSaleDetail(PartSale $sale, PartSaleDetail $detail, ?Part $part = null): ?WarrantyRegistration
    {
        $periodDays = (int) ($detail->warranty_period_days ?? 0);
        if ($periodDays <= 0 || empty($detail->warranty_start_date) || empty($detail->warranty_end_date)) {
            return null;
        }

        $partModel = $part ?? $detail->part;
        if (!$partModel) {
            return null;
        }

        $startDate = Carbon::parse($detail->warranty_start_date)->toDateString();
        $endDate = Carbon::parse($detail->warranty_end_date)->toDateString();

        return WarrantyRegistration::updateOrCreate(
            [
                'source_type' => PartSale::class,
                'source_id' => $sale->id,
                'source_detail_id' => $detail->id,
            ],
            [
                'warrantable_type' => Part::class,
                'warrantable_id' => $partModel->id,
                'customer_id' => $sale->customer_id,
                'vehicle_id' => null,
                'warranty_period_days' => $periodDays,
                'warranty_start_date' => $startDate,
                'warranty_end_date' => $endDate,
                'status' => $this->resolveStatus($detail->warranty_claimed_at, $endDate),
                'claimed_at' => $detail->warranty_claimed_at,
                'claim_notes' => $detail->warranty_claim_notes,
                'metadata' => [
                    'part_sale_number' => $sale->sale_number,
                    'part_name' => $partModel->name,
                    'part_number' => $partModel->part_number,
                    'part_sale_detail_id' => $detail->id,
                ],
            ]
        );
    }

    public function markClaimedFromPartSaleDetail(PartSaleDetail $detail, ?int $claimedBy = null): void
    {
        WarrantyRegistration::query()
            ->where('source_type', PartSale::class)
            ->where('source_id', $detail->part_sale_id)
            ->where('source_detail_id', $detail->id)
            ->update([
                'status' => 'claimed',
                'claimed_at' => $detail->warranty_claimed_at,
                'claimed_by' => $claimedBy,
                'claim_notes' => $detail->warranty_claim_notes,
                'updated_at' => now(),
            ]);
    }

    public function removeByPartSale(int $partSaleId): void
    {
        WarrantyRegistration::query()
            ->where('source_type', PartSale::class)
            ->where('source_id', $partSaleId)
            ->delete();
    }

    public function registerFromServiceOrderDetail(ServiceOrder $order, ServiceOrderDetail $detail): ?WarrantyRegistration
    {
        $warrantableType = null;
        $warrantableId = null;
        $periodDays = 0;

        if ($detail->service_id) {
            /** @var Service|null $service */
            $service = $detail->service;
            if ($service && $service->has_warranty) {
                $periodDays = (int) ($service->warranty_duration_days ?? 0);
                $warrantableType = Service::class;
                $warrantableId = $service->id;
            }
        } elseif ($detail->part_id) {
            /** @var Part|null $part */
            $part = $detail->part;
            if ($part && $part->has_warranty) {
                $periodDays = (int) ($part->warranty_duration_days ?? 0);
                $warrantableType = Part::class;
                $warrantableId = $part->id;
            }
        }

        if ($periodDays <= 0 || !$warrantableType || !$warrantableId) {
            return null;
        }

        $start = ($order->actual_finish_at ?? now())->copy()->startOfDay();
        $end = (clone $start)->addDays($periodDays);

        return WarrantyRegistration::updateOrCreate(
            [
                'source_type' => ServiceOrder::class,
                'source_id' => $order->id,
                'source_detail_id' => $detail->id,
            ],
            [
                'warrantable_type' => $warrantableType,
                'warrantable_id' => $warrantableId,
                'customer_id' => $order->customer_id,
                'vehicle_id' => $order->vehicle_id,
                'warranty_period_days' => $periodDays,
                'warranty_start_date' => $start->toDateString(),
                'warranty_end_date' => $end->toDateString(),
                'status' => $this->resolveStatus(null, $end->toDateString()),
                'claimed_at' => null,
                'claim_notes' => null,
                'metadata' => [
                    'service_order_number' => $order->order_number,
                    'service_order_detail_id' => $detail->id,
                    'detail_type' => $detail->service_id ? 'service' : 'part',
                    'item_name' => $detail->service?->title ?? $detail->part?->name,
                ],
            ]
        );
    }

    public function removeByServiceOrder(int $serviceOrderId): void
    {
        WarrantyRegistration::query()
            ->where('source_type', ServiceOrder::class)
            ->where('source_id', $serviceOrderId)
            ->delete();
    }

    private function resolveStatus($claimedAt, string $endDate): string
    {
        if (!empty($claimedAt)) {
            return 'claimed';
        }

        $today = now()->startOfDay();
        $end = Carbon::parse($endDate)->startOfDay();
        if ($end->lt($today)) {
            return 'expired';
        }

        return 'active';
    }
}
