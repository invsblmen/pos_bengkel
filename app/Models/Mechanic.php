<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mechanic extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'phone', 'employee_number', 'notes',
    ];

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
        return $this->employee_number ? $this->name . ' (' . $this->employee_number . ')' : $this->name;
    }
}
