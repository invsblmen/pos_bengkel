<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'icon', 'sort_order'
    ];

    public function parts()
    {
        return $this->hasMany(Part::class);
    }
}
