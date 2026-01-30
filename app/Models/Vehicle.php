<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'plate_number', 'brand', 'model', 'year', 'notes',
        'engine_type', 'transmission_type', 'color', 'cylinder_volume',
        'features',
        'chassis_number', 'engine_number', 'manufacture_year',
        'registration_number', 'registration_date', 'stnk_expiry_date', 'previous_owner'
    ];

    protected $casts = [
        'registration_date' => 'date',
        'stnk_expiry_date' => 'date',
        'features' => 'array',
    ];

    protected $appends = ['formatted_plate_number'];

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
        return "{$this->getFormattedPlateNumberAttribute()} - {$this->brand} {$this->model}";
    }

    /**
     * Format plate number with spaces for better readability
     * Example: "AB1234CD" becomes "AB 1234 CD"
     */
    public function getFormattedPlateNumberAttribute()
    {
        $plate = preg_replace('/\s+/', '', $this->plate_number); // Remove all spaces

        // Pattern: 2 letters, 1-4 numbers, 1-3 letters
        if (preg_match('/^([A-Z]{1,2})(\d{1,4})([A-Z]{1,3})$/', $plate, $matches)) {
            return trim($matches[1] . ' ' . $matches[2] . ' ' . $matches[3]);
        }

        // Fallback: return as-is if doesn't match pattern
        return $plate;
    }
}
