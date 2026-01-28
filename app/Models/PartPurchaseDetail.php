<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\DiscountTaxService;

class PartPurchaseDetail extends Model
{
    protected $fillable = [
        'part_purchase_id',
        'part_id',
        'quantity',
        'unit_price',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'final_amount',
        'margin_type',
        'margin_value',
        'promo_discount_type',
        'promo_discount_value',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'subtotal' => 'integer',
        'discount_value' => 'float',
        'discount_amount' => 'integer',
        'final_amount' => 'integer',
        'margin_value' => 'float',
        'promo_discount_value' => 'float',
    ];

    public function partPurchase()
    {
        return $this->belongsTo(PartPurchase::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Calculate final amount with discount
     */
    public function calculateFinalAmount()
    {
        $this->final_amount = DiscountTaxService::calculateAmountWithDiscount(
            $this->subtotal ?? 0,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0
        );

        if ($this->discount_type !== 'none' && $this->discount_value) {
            $this->discount_amount = $this->subtotal - $this->final_amount;
        } else {
            $this->discount_amount = 0;
        }

        return $this;
    }

    /**
     * Calculate selling price based on margin
     *
     * @return int selling price per unit
     */
    public function calculateSellingPrice()
    {
        $costPerUnit = $this->unit_price ?? 0;

        if ($this->margin_type === 'percent') {
            // Percentage margin: selling_price = cost + (cost * margin / 100)
            return (int) round($costPerUnit + ($costPerUnit * ($this->margin_value ?? 0) / 100));
        } else {
            // Fixed margin: selling_price = cost + fixed_amount
            return (int) round($costPerUnit + ($this->margin_value ?? 0));
        }
    }

    /**
     * Calculate remaining quantity available (for FIFO tracking)
     *
     * @return int quantity remaining from this purchase
     */
    public function getRemainingQuantity()
    {
        $outbound = PartStockMovement::where('part_purchase_detail_id', $this->id)
            ->where('movement_type', 'outbound')
            ->sum('quantity');

        return max(0, $this->quantity - ($outbound ?? 0));
    }
}
