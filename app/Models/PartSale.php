<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\CashRoundingService;
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
        'voucher_id',
        'voucher_code',
        'voucher_discount_amount',
        'tax_type',
        'tax_value',
        'tax_amount',
        'rounding_adjustment',
        'grand_total',
        'payment_method',
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
        'voucher_id' => 'integer',
        'voucher_discount_amount' => 'integer',
        'tax_value' => 'float',
        'tax_amount' => 'integer',
        'rounding_adjustment' => 'integer',
        'grand_total' => 'integer',
        'payment_method' => 'string',
        'paid_amount' => 'integer',
        'remaining_amount' => 'integer',
        'payment_status' => 'string',
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

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
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

        $voucherDiscountAmount = max(0, (int) ($this->voucher_discount_amount ?? 0));
        $amountAfterDiscount = max(0, $subtotal - $this->discount_amount - $voucherDiscountAmount);

        // Apply transaction-level tax
        $this->tax_amount = DiscountTaxService::calculateTax(
            $amountAfterDiscount,
            $this->tax_type ?? 'none',
            $this->tax_value ?? 0
        );

        $rawTotal = $amountAfterDiscount + $this->tax_amount;
        $rounding = CashRoundingService::roundToCashDenomination($rawTotal);
        $this->rounding_adjustment = $rounding['rounding_adjustment'];
        $this->grand_total = $rounding['grand_total'];

        $paidAmount = max(0, (int) ($this->paid_amount ?? 0));
        $this->paid_amount = $paidAmount;
        $this->remaining_amount = max(0, $this->grand_total - $paidAmount);

        if ($paidAmount >= $this->grand_total) {
            $this->payment_status = 'paid';
            $this->remaining_amount = 0;
        } elseif ($paidAmount > 0) {
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
