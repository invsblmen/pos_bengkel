<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\DiscountTaxService;

class ServiceOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number', 'customer_id', 'vehicle_id', 'mechanic_id', 'status', 'odometer_km',
        'estimated_start_at', 'estimated_finish_at',
        'actual_start_at', 'actual_finish_at',
        'total', 'labor_cost', 'material_cost', 'warranty_period', 'notes',
        'maintenance_type', 'next_service_km', 'next_service_date',
        'discount_type', 'discount_value', 'discount_amount',
        'tax_type', 'tax_value', 'tax_amount', 'grand_total'
    ];

    protected $casts = [
        'estimated_start_at' => 'datetime',
        'estimated_finish_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_finish_at' => 'datetime',
        'total' => 'integer',
        'labor_cost' => 'integer',
        'material_cost' => 'integer',
        'warranty_period' => 'integer',
        'odometer_km' => 'integer',
        'discount_amount' => 'integer',
        'tax_amount' => 'integer',
        'grand_total' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(Mechanic::class);
    }

    public function details()
    {
        return $this->hasMany(ServiceOrderDetail::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'service_order_tags');
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(ServiceOrderStatusHistory::class)->orderByDesc('created_at');
    }

    /**
     * Calculate and update the service order totals
     */
    public function recalculateTotals()
    {
        $amountSum = $this->details()->sum('amount') ?? 0;
        $finalSum = $this->details()->sum('final_amount') ?? 0;

        // Subtotal uses amounts after item-level discount
        $subtotal = $finalSum;
        $itemDiscount = max(0, $amountSum - $finalSum);

        $totals = DiscountTaxService::calculateTotal(
            $subtotal,
            $this->discount_type ?? 'none',
            $this->discount_value ?? 0,
            $this->tax_type ?? 'none',
            $this->tax_value ?? 0
        );

        $this->total = $subtotal;
        $this->discount_amount = $itemDiscount + ($totals['discount_amount'] ?? 0);
        $this->tax_amount = $totals['tax_amount'] ?? 0;
        $this->grand_total = ($subtotal - ($totals['discount_amount'] ?? 0)) + ($totals['tax_amount'] ?? 0);

        return $this;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
