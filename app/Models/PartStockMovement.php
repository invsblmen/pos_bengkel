<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartStockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_id',
        'type',
        'qty',
        'before_stock',
        'after_stock',
        'unit_price',
        'supplier_id',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}