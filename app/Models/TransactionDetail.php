<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use HasFactory;
    
    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'transaction_id', 'product_id', 'service_id', 'part_id', 'qty', 'price'
    ];

    /**
     * transaction
     *
     * @return void
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * product
     *
     * @return void
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * service
     *
     * @return void
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * part
     *
     * @return void
     */
    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
