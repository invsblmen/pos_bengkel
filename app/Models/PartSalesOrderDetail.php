<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartSalesOrderDetail extends Model
{
    protected $fillable = [
        'part_sales_order_id',
        'part_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'subtotal' => 'integer',
    ];

    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(PartSalesOrder::class, 'part_sales_order_id');
    }

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }
}
