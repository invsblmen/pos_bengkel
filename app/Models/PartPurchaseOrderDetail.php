<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartPurchaseOrderDetail extends Model
{
    protected $table = 'part_purchase_order_details';

    protected $fillable = [
        'part_purchase_order_id',
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

    public function purchaseOrder()
    {
        return $this->belongsTo(PartPurchaseOrder::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}

