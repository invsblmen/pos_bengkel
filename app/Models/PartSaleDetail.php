<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\DiscountTaxService;

class PartSaleDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_sale_id',
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

    // Relationships
    public function partSale()
    {
        return $this->belongsTo(PartSale::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    // Methods
    public function calculateFinalAmount()
    {
        // Calculate subtotal
        $this->subtotal = $this->quantity * $this->unit_price;

        // Apply item-level discount
        $this->discount_amount = DiscountTaxService::calculateDiscountAmount(
            $this->subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0
        );

        $this->final_amount = $this->subtotal - $this->discount_amount;

        return $this;
    }
}
