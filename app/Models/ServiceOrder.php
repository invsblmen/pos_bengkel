<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number', 'customer_id', 'vehicle_id', 'mechanic_id', 'status', 'estimated_start_at', 'estimated_finish_at', 'total', 'notes',
    ];

    protected $casts = [
        'estimated_start_at' => 'datetime',
        'estimated_finish_at' => 'datetime',
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
}
