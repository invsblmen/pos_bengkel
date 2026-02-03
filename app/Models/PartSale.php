<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\DiscountTaxService;

class PartSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_number',
        'customer_id',
        'sale_date',
        'part_sales_order_id',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'tax_type',
        'tax_value',
        'tax_amount',
        'grand_total',
        'paid_amount',
        'remaining_amount',
        'payment_status',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'integer',
        'discount_value' => 'float',
        'discount_amount' => 'integer',
        'tax_value' => 'float',
        'tax_amount' => 'integer',
        'grand_total' => 'integer',
        'paid_amount' => 'integer',
        'remaining_amount' => 'integer',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesOrder()
    {
        return $this->belongsTo(PartSalesOrder::class, 'part_sales_order_id');
    }

    public function details()
    {
        return $this->hasMany(PartSaleDetail::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function stockMovements()
    {
        return $this->morphMany(PartStockMovement::class, 'reference');
    }

    // Methods
    public function recalculateTotals()
    {
        // Calculate subtotal from details (use final_amount which includes item discounts)
        $subtotal = $this->details->sum(function($detail) {
            return $detail->final_amount ?? $detail->subtotal;
        });

        $this->subtotal = $subtotal;

        // Apply transaction-level discount
        $this->discount_amount = DiscountTaxService::calculateDiscount(
            $subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0
        );

        $amountAfterDiscount = $subtotal - $this->discount_amount;

        // Apply transaction-level tax
        $this->tax_amount = DiscountTaxService::calculateTax(
            $amountAfterDiscount,
            $this->tax_type ?? 'none',
            $this->tax_value ?? 0
        );

        $this->grand_total = $amountAfterDiscount + $this->tax_amount;

        // Update remaining amount
        $this->remaining_amount = $this->grand_total - $this->paid_amount;

        // Update payment status
        if ($this->paid_amount >= $this->grand_total) {
            $this->payment_status = 'paid';
            $this->remaining_amount = 0;
        } elseif ($this->paid_amount > 0) {
            $this->payment_status = 'partial';
        } else {
            $this->payment_status = 'unpaid';
        }

        return $this;
    }

    public static function generateSaleNumber()
    {
        $prefix = 'SAL';
        $date = now()->format('Ymd');
        $lastSale = static::whereDate('created_at', now()->toDateString())
            ->latest('id')
            ->first();

        $number = $lastSale ? (intval(substr($lastSale->sale_number, -4)) + 1) : 1;

        return $prefix . $date . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
