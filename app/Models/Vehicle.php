<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'plate_number', 'brand', 'model', 'year', 'km', 'notes',
        'engine_type', 'transmission_type', 'color', 'cylinder_volume',
        'last_service_date', 'next_service_date', 'features'
    ];

    protected $casts = [
        'last_service_date' => 'date',
        'next_service_date' => 'date',
        'features' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function getDisplayAttribute()
    {
        return "{$this->plate_number} - {$this->brand} {$this->model}";
    }
}
