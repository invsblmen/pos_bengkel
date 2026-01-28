<?php

namespace App\Models;

use App\Services\DiscountTaxService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'part_id',
        'qty',
        'unit_price',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'final_amount',
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_price' => 'integer',
        'subtotal' => 'integer',
        'discount_value' => 'float',
        'discount_amount' => 'integer',
        'final_amount' => 'integer',
    ];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function calculateFinalAmount(): self
    {
        $this->subtotal = $this->qty * $this->unit_price;

        $this->discount_amount = DiscountTaxService::calculateDiscount(
            $this->subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0
        );

        $this->final_amount = $this->subtotal - $this->discount_amount;

        return $this;
    }
}
