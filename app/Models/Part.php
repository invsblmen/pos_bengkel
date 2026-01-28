<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Part extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku', 'part_number', 'barcode', 'name', 'description', 'stock', 'supplier_id',
        'part_category_id', 'unit_measure', 'reorder_level', 'status'
    ];

    protected $casts = [
        'stock' => 'integer',
        'reorder_level' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(PartCategory::class, 'part_category_id');
    }

    public function serviceOrderDetails()
    {
        return $this->hasMany(ServiceOrderDetail::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(PartStockMovement::class);
    }

    public function purchases()
    {
        return $this->hasMany(PartPurchase::class);
    }

    /**
     * Get the current cost price based on FIFO (oldest remaining purchase)
     */
    public function getCurrentCostPrice()
    {
        $purchase = $this->purchases()
            ->whereHas('movements', function ($query) {
                $query->where('remaining_qty', '>', 0);
            })
            ->orderBy('created_at', 'asc')
            ->first();

        return $purchase ? $purchase->unit_cost : 0;
    }

    /**
     * Get the selling price for this purchase batch
     */
    public function getSellingPrice($purchase = null)
    {
        if (!$purchase) {
            $purchase = $this->purchases()
                ->where('status', 'received')
                ->orderBy('created_at', 'asc')
                ->first();
        }

        if (!$purchase) {
            return 0;
        }

        $costPrice = $purchase->unit_cost;

        if ($purchase->margin_type === 'percent') {
            return $costPrice + ($costPrice * $purchase->margin_value / 100);
        } else {
            return $costPrice + $purchase->margin_value;
        }
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= reorder_level');
    }
}
