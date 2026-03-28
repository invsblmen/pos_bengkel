<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'is_active',
        'starts_at',
        'ends_at',
        'quota_total',
        'quota_used',
        'limit_per_customer',
        'discount_type',
        'discount_value',
        'scope',
        'min_purchase',
        'max_discount',
        'can_combine_with_discount',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'quota_total' => 'integer',
        'quota_used' => 'integer',
        'limit_per_customer' => 'integer',
        'discount_value' => 'float',
        'min_purchase' => 'integer',
        'max_discount' => 'integer',
        'can_combine_with_discount' => 'boolean',
    ];

    public function eligibilities()
    {
        return $this->hasMany(VoucherEligibility::class);
    }

    public function usages()
    {
        return $this->hasMany(VoucherUsage::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
