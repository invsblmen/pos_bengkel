<?php

namespace App\Models;

use App\Services\DiscountTaxService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice',
        'supplier_id',
        'notes',
        'total',
        'discount_type',
        'discount_value',
        'discount_amount',
        'tax_type',
        'tax_value',
        'tax_amount',
        'created_by',
    ];

    protected $casts = [
        'total' => 'integer',
        'discount_value' => 'float',
        'discount_amount' => 'integer',
        'tax_value' => 'float',
        'tax_amount' => 'integer',
    ];

    public function details()
    {
        return $this->hasMany(PurchaseDetail::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recalculateTotals(): self
    {
        $subtotal = $this->details->sum(function ($detail) {
            return $detail->final_amount ?? $detail->subtotal;
        });

        $this->discount_amount = DiscountTaxService::calculateDiscount(
            $subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0
        );

        $afterDiscount = $subtotal - $this->discount_amount;

        $this->tax_amount = DiscountTaxService::calculateTax(
            $afterDiscount,
            $this->tax_type ?? 'none',
            $this->tax_value ?? 0
        );

        $this->total = $afterDiscount + $this->tax_amount;

        return $this;
    }
}
