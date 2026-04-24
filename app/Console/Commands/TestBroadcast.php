<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Events\PartPurchaseCreated;
use App\Support\DispatchesBroadcastSafely;

class TestBroadcast extends Command
{
    use DispatchesBroadcastSafely;

    protected $signature = 'test:broadcast';

    protected $description = 'Dispatch a PartPurchaseCreated event to test broadcasting behavior';

    public function handle()
    {
        $payload = [
            'id' => 0,
            'purchase_number' => 'TEST-BROADCAST-' . time(),
        ];

        $this->dispatchBroadcastSafely(fn() => broadcast(new PartPurchaseCreated($payload)), PartPurchaseCreated::class);

        $this->info('Test broadcast dispatched (safely).');
        return 0;
    }
}
