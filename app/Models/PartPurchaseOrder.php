<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartPurchaseOrder extends Model
{
    use SoftDeletes;

    protected $table = 'part_purchase_orders';

    protected $fillable = [
        'po_number',
        'supplier_id',
        'po_date',
        'expected_delivery_date',
        'actual_delivery_date',
        'status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'total_amount' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->po_number)) {
                $model->po_number = self::generatePoNumber();
            }
        });
    }

    public static function generatePoNumber()
    {
        $date = now()->format('Ymd');
        $prefix = "PO-{$date}-";
        $lastOrder = self::where('po_number', 'like', $prefix . '%')
            ->orderBy('po_number', 'desc')->first();
        $newNumber = $lastOrder ? intval(substr($lastOrder->po_number, -4)) + 1 : 1;
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function details()
    {
        return $this->hasMany(PartPurchaseOrderDetail::class);
    }

    public function stockMovements()
    {
        return $this->morphMany(PartStockMovement::class, 'reference');
    }
}

