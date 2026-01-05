<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartSale extends Model
{
    use HasFactory;

    protected $fillable = ['invoice', 'total', 'notes', 'created_by'];

    public function details()
    {
        return $this->hasMany(PartSaleDetail::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
