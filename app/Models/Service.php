<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'title', 'description', 'est_time_minutes', 'price',
    ];

    public function serviceOrderDetails()
    {
        return $this->hasMany(ServiceOrderDetail::class);
    }
}
