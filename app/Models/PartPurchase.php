<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'expected_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'total_amount' => 'integer',
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
