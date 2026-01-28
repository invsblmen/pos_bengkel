<?php

namespace App\Services;

use App\Models\Part;
use App\Models\PartPurchaseDetail;
use App\Models\PartSaleDetail;
use Illuminate\Support\Facades\DB;

class FIFOCostingService
{
    /**
     * Allocate stock using FIFO (First In First Out) method
     * Returns array of allocations with purchase details and quantities
     *
     * @param int $partId
     * @param int $quantityNeeded
     * @return array ['success' => bool, 'allocations' => array, 'message' => string]
     */
    public static function allocateStock($partId, $quantityNeeded)
    {
        $allocations = [];
        $remainingQty = $quantityNeeded;

        // Get oldest purchase details with available stock (FIFO)
        $purchaseDetails = PartPurchaseDetail::whereHas('partPurchase', function ($query) {
                $query->where('status', 'received');
            })
            ->where('part_id', $partId)
            ->oldest('created_at')
            ->get();

        foreach ($purchaseDetails as $detail) {
            if ($remainingQty <= 0) {
                break;
            }

            $remainingStock = $detail->getRemainingQuantity();

            if ($remainingStock > 0) {
                $allocatedQty = min($remainingStock, $remainingQty);

                $allocations[] = [
                    'purchase_detail_id' => $detail->id,
                    'purchase_detail' => $detail,
                    'quantity' => $allocatedQty,
                    'cost_price' => $detail->unit_price,
                    'selling_price' => $detail->calculateSellingPrice(),
                ];

                $remainingQty -= $allocatedQty;
            }
        }

        // Check if we have enough stock
        if ($remainingQty > 0) {
            return [
                'success' => false,
                'allocations' => [],
                'message' => "Insufficient stock. Need {$quantityNeeded}, available " . ($quantityNeeded - $remainingQty),
            ];
        }

        return [
            'success' => true,
            'allocations' => $allocations,
            'message' => 'Stock allocated successfully',
        ];
    }

    /**
     * Create stock movements for FIFO-allocated sales
     *
     * @param PartSaleDetail $saleDetail
     * @param array $allocations
     * @return void
     */
    public static function createStockMovements($saleDetail, $allocations)
    {
        foreach ($allocations as $allocation) {
            \App\Models\PartStockMovement::create([
                'part_id' => $saleDetail->part_id,
                'part_purchase_detail_id' => $allocation['purchase_detail_id'],
                'part_sale_detail_id' => $saleDetail->id,
                'movement_type' => 'outbound',
                'quantity' => $allocation['quantity'],
                'reference_type' => 'part_sale',
                'reference_id' => $saleDetail->part_sale_id,
                'notes' => "FIFO allocation from purchase detail #{$allocation['purchase_detail_id']}",
            ]);
        }
    }

    /**
     * Calculate weighted average cost and selling price from allocations
     *
     * @param array $allocations
     * @return array ['cost_price' => int, 'selling_price' => int]
     */
    public static function calculateWeightedPrices($allocations)
    {
        $totalQty = 0;
        $totalCost = 0;
        $totalSelling = 0;

        foreach ($allocations as $allocation) {
            $qty = $allocation['quantity'];
            $totalQty += $qty;
            $totalCost += $allocation['cost_price'] * $qty;
            $totalSelling += $allocation['selling_price'] * $qty;
        }

        if ($totalQty == 0) {
            return ['cost_price' => 0, 'selling_price' => 0];
        }

        return [
            'cost_price' => (int) round($totalCost / $totalQty),
            'selling_price' => (int) round($totalSelling / $totalQty),
        ];
    }
}
