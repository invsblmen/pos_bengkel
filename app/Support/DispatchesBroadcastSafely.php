<?php

namespace App\Support;

use Illuminate\Broadcasting\BroadcastException;
use Illuminate\Support\Facades\Log;
use Throwable;

trait DispatchesBroadcastSafely
{
    protected function dispatchBroadcastSafely(callable $dispatcher, string $eventName): void
    {
        // If realtime is explicitly disabled via env, skip broadcasting entirely.
        if (env('DISABLE_REALTIME', false)) {
            Log::info('Realtime broadcasting disabled by DISABLE_REALTIME env var.', ['event' => $eventName]);
            return;
        }

        // If broadcasting driver is set to a non-network driver, skip network calls.
        $driver = config('broadcasting.default');
        if (in_array($driver, ['log', 'null'], true)) {
            Log::info('Skipping broadcast because broadcasting driver is ' . $driver, ['event' => $eventName]);
            return;
        }

        try {
            $dispatcher();
        } catch (BroadcastException $e) {
            // Broadcast failures should not fail the main transaction flow.
            Log::warning('Broadcast skipped because broadcaster is unreachable.', [
                'event' => $eventName,
                'message' => $e->getMessage(),
            ]);
        } catch (Throwable $e) {
            // Some broadcaster failures bubble up as transport exceptions (e.g. Guzzle RequestException).
            // Treat them as non-fatal to keep business flow successful.
            Log::warning('Broadcast skipped because transport failed.', [
                'event' => $eventName,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
        }
    }
}
