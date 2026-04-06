<?php

namespace App\Events;

use App\Models\WhatsAppOutboundMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhatsAppOutboundUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public WhatsAppOutboundMessage $outbound)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('workshop.whatsapp')];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.outbound.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->outbound->id,
            'status' => $this->outbound->status,
            'event_type' => $this->outbound->event_type,
            'created_at' => $this->outbound->created_at,
            'updated_at' => $this->outbound->updated_at,
        ];
    }
}
