<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\DiscountTaxService;

class PartPurchase extends Model
{
    protected $fillable = [
        'purchase_number',
        'supplier_id',
        'purchase_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'status',
        'total_amount',
        'notes',
        'discount_type', 'discount_value', 'discount_amount',
        'tax_type', 'tax_value', 'tax_amount', 'grand_total'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'total_amount' => 'integer',
        'discount_amount' => 'integer',
        'tax_amount' => 'integer',
        'grand_total' => 'integer',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details()
    {
        return $this->hasMany(PartPurchaseDetail::class);
    }

    public function stockMovements()
    {
        return $this->morphMany(PartStockMovement::class, 'reference');
    }

    /**
     * Calculate and update the purchase totals
     */
    public function recalculateTotals()
    {
        // Calculate subtotal from details (use final_amount if available, otherwise subtotal)
        $subtotal = $this->details->sum(function($detail) {
            return $detail->final_amount ?? $detail->subtotal;
        });

        $totals = DiscountTaxService::calculateTotal(
            $subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0,
            $this->tax_type ?? 'none',
            $this->tax_value ?? 0
        );

        $this->total_amount = $subtotal;
        $this->discount_amount = $totals['discount_amount'];
        $this->tax_amount = $totals['tax_amount'];
        $this->grand_total = $totals['grand_total'];

        return $this;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->purchase_number)) {
                $model->purchase_number = self::generatePurchaseNumber();
            }
        });
    }

    public static function generatePurchaseNumber()
    {
        $date = now()->format('Ymd');
        $prefix = "PUR-{$date}-";

        $lastPurchase = self::where('purchase_number', 'like', $prefix . '%')
            ->orderBy('purchase_number', 'desc')
            ->first();

        if ($lastPurchase) {
            $lastNumber = intval(substr($lastPurchase->purchase_number, -4));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
