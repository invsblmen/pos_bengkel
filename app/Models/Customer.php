<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'name', 'phone', 'email', 'gender', 'birth_date', 'address', 'city', 'postal_code',
        'identity_type', 'identity_number'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->phone})";
    }
}
