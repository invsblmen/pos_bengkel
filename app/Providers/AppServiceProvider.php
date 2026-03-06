<?php

namespace App\Providers;

use App\Models\PartSale;
use App\Observers\PartSaleObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Carbon;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PartSale::observe(PartSaleObserver::class);

        // Ensure all Carbon dates serialize to a stable local string without timezone shifts
        Carbon::serializeUsing(function ($carbon) {
            return $carbon->format('Y-m-d H:i:s');
        });
    }
}
