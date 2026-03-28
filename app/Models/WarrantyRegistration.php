<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarrantyRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'warrantable_type',
        'warrantable_id',
        'source_type',
        'source_id',
        'source_detail_id',
        'customer_id',
        'vehicle_id',
        'warranty_period_days',
        'warranty_start_date',
        'warranty_end_date',
        'status',
        'claimed_at',
        'claimed_by',
        'claim_notes',
        'metadata',
    ];

    protected $casts = [
        'customer_id' => 'integer',
        'vehicle_id' => 'integer',
        'source_id' => 'integer',
        'source_detail_id' => 'integer',
        'warrantable_id' => 'integer',
        'warranty_period_days' => 'integer',
        'warranty_start_date' => 'date',
        'warranty_end_date' => 'date',
        'claimed_at' => 'datetime',
        'claimed_by' => 'integer',
        'metadata' => 'array',
    ];

    public function warrantable()
    {
        return $this->morphTo();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function claimedByUser()
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }
}
