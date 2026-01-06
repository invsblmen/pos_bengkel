<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartPurchaseDetail extends Model
{
    protected $fillable = [
        'part_purchase_id',
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

    public function partPurchase()
    {
        return $this->belongsTo(PartPurchase::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
