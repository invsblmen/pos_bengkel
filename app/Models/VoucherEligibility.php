<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherEligibility extends Model
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'eligible_type',
        'eligible_id',
    ];

    protected $casts = [
        'voucher_id' => 'integer',
        'eligible_id' => 'integer',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
