<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Part extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku', 'name', 'description', 'buy_price', 'sell_price', 'stock', 'supplier_id',
        'part_category_id', 'unit_measure', 'reorder_level', 'status'
    ];

    protected $casts = [
        'buy_price' => 'integer',
        'sell_price' => 'integer',
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

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= reorder_level');
    }
}
