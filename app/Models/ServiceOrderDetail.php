<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrderDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_order_id', 'service_id', 'part_id', 'qty', 'price', 'notes',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
