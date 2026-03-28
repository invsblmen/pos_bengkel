<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'customer_id',
        'source_type',
        'source_id',
        'discount_amount',
        'used_at',
        'metadata',
    ];

    protected $casts = [
        'voucher_id' => 'integer',
        'customer_id' => 'integer',
        'source_id' => 'integer',
        'discount_amount' => 'integer',
        'used_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
