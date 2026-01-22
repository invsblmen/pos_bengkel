<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceOrderStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_order_id',
        'old_status',
        'new_status',
        'user_id',
        'notes',
    ];

    public function serviceOrder()
    {
        return $this->belongsTo(ServiceOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
