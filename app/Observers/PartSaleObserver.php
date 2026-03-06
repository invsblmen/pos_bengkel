<?php

namespace App\Observers;

use App\Events\PartSaleDeleted;
use App\Events\PartSaleUpdated;
use App\Models\PartSale;

class PartSaleObserver
{
    public function updated(PartSale $partSale): void
    {
        event(new PartSaleUpdated([
            'id' => $partSale->id,
            'sale_number' => $partSale->sale_number,
            'status' => $partSale->status,
            'payment_status' => $partSale->payment_status,
            'grand_total' => $partSale->grand_total,
            'updated_at' => $partSale->updated_at?->toISOString(),
        ]));
    }

    public function deleted(PartSale $partSale): void
    {
        event(new PartSaleDeleted([
            'id' => $partSale->id,
            'sale_number' => $partSale->sale_number,
            'status' => $partSale->status,
            'payment_status' => $partSale->payment_status,
            'grand_total' => $partSale->grand_total,
            'deleted_at' => now()->toISOString(),
        ]));
    }
}
