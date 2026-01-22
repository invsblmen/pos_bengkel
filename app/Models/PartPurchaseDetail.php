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
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'subtotal' => 'integer',
        'discount_value' => 'float',
        'discount_amount' => 'integer',
        'final_amount' => 'integer',
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
}
