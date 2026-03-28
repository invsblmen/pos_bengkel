<?php

namespace App\Support;

use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Support\Facades\Log;

trait DispatchesBroadcastSafely
{
    protected function dispatchBroadcastSafely(callable $dispatcher, string $eventName): void
    {
        try {
            $dispatcher();
        } catch (BroadcastException $e) {
            // Broadcast failures should not fail the main transaction flow.
            Log::warning('Broadcast skipped because broadcaster is unreachable.', [
                'event' => $eventName,
                'message' => $e->getMessage(),
            ]);
        }
    }
}