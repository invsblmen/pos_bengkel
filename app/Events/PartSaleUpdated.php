<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PartSaleUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $partSale;

    public function __construct(array $partSale)
    {
        $this->partSale = $partSale;
    }

    public function broadcastOn(): array
    {
        return [new Channel('workshop.partsales')];
    }

    public function broadcastAs(): string
    {
        return 'partsale.updated';
    }

    public function broadcastWith(): array
    {
        return ['partSale' => $this->partSale];
    }
}
