<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartSaleDetail extends Model
{
    use HasFactory;

    protected $fillable = ['part_sale_id', 'part_id', 'qty', 'unit_price', 'subtotal'];

    public function sale()
    {
        return $this->belongsTo(PartSale::class, 'part_sale_id');
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
