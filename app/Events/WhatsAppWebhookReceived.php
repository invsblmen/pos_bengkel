<?php

namespace App\Events;

use App\Models\WhatsAppWebhookEvent;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhatsAppWebhookReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public WhatsAppWebhookEvent $webhookEvent)
    {
    }

    public function broadcastOn(): array
    {
        return [new Channel('workshop.whatsapp')];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.webhook.received';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->webhookEvent->id,
            'event' => $this->webhookEvent->event,
            'signature_valid' => $this->webhookEvent->signature_valid,
            'received_at' => $this->webhookEvent->received_at,
            'created_at' => $this->webhookEvent->created_at,
        ];
    }
}
