<?php

use App\Models\LowStockAlert;
use App\Models\Part;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Artisan::command('low-stock:sync', function () {
    $lowStockParts = Part::lowStock()->get(['id', 'stock', 'minimal_stock']);

    foreach ($lowStockParts as $part) {
        LowStockAlert::updateOrCreate(
            ['part_id' => $part->id],
            [
                'current_stock' => $part->stock,
                'minimal_stock' => $part->minimal_stock,
            ]
        );
    }

    LowStockAlert::whereNotIn('part_id', $lowStockParts->pluck('id'))->delete();

    $this->info("Low stock alerts synced: {$lowStockParts->count()}");
})->purpose('Sync low stock alerts based on minimal stock');

Schedule::command('low-stock:sync')->hourly();
