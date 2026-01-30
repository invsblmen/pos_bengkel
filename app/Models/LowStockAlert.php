<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LowStockAlert extends Model
{
    protected $fillable = [
        'part_id',
        'current_stock',
        'minimal_stock',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'current_stock' => 'integer',
        'minimal_stock' => 'integer',
    ];

    public function part(): BelongsTo
    {
        return $this->belongsTo(Part::class);
    }
}
