<?php

namespace App\Notifications;

use App\Models\PartPurchase;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PartPurchasePendingNotification extends Notification
{
    use Queueable;

    public function __construct(private PartPurchase $purchase, private string $context = 'created')
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $title = 'Pembelian Part Pending';
        $message = $this->context === 'status-change'
            ? "Status pembelian {$this->purchase->purchase_number} diubah ke pending."
            : "Pembelian {$this->purchase->purchase_number} dibuat dengan status pending.";

        return [
            'title' => $title,
            'message' => $message,
            'reference' => $this->purchase->purchase_number,
            'purchase_id' => $this->purchase->id,
            'status' => $this->purchase->status,
            'context' => $this->context,
        ];
    }
}
