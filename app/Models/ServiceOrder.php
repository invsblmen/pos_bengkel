<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number', 'customer_id', 'vehicle_id', 'mechanic_id', 'status',
        'estimated_start_at', 'estimated_finish_at',
        'actual_start_at', 'actual_finish_at',
        'total', 'labor_cost', 'material_cost', 'warranty_period', 'notes',
    ];

    protected $casts = [
        'estimated_start_at' => 'datetime',
        'estimated_finish_at' => 'datetime',
        'actual_start_at' => 'datetime',
        'actual_finish_at' => 'datetime',
        'total' => 'integer',
        'labor_cost' => 'integer',
        'material_cost' => 'integer',
        'warranty_period' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(Mechanic::class);
    }

    public function details()
    {
        return $this->hasMany(ServiceOrderDetail::class);
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
