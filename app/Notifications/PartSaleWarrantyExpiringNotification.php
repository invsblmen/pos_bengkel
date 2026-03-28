<?php

namespace App\Notifications;

use App\Models\PartSale;
use App\Models\ServiceOrder;
use App\Models\WarrantyRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PartSaleWarrantyExpiringNotification extends Notification
{
    use Queueable;

    public function __construct(private WarrantyRegistration $registration, private int $daysLeft)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $sourceType = $this->registration->source_type;
        $itemName = $this->registration->metadata['item_name']
            ?? $this->registration->metadata['part_name']
            ?? 'Item';
        $endDate = optional($this->registration->warranty_end_date)->format('d M Y') ?? '-';

        $reference = '-';
        $sourceLabel = 'transaksi';
        $saleId = null;
        $serviceOrderId = null;

        if ($sourceType === PartSale::class) {
            $reference = $this->registration->metadata['part_sale_number'] ?? '-';
            $sourceLabel = 'part sale';
            $saleId = $this->registration->source_id;
        } elseif ($sourceType === ServiceOrder::class) {
            $reference = $this->registration->metadata['service_order_number'] ?? '-';
            $sourceLabel = 'service order';
            $serviceOrderId = $this->registration->source_id;
        }

        return [
            'title' => 'Garansi Akan Expired',
            'message' => "Garansi {$itemName} untuk {$sourceLabel} {$reference} berakhir {$endDate} ({$this->daysLeft} hari lagi).",
            'reference' => $reference,
            'sale_id' => $saleId,
            'service_order_id' => $serviceOrderId,
            'warranty_registration_id' => $this->registration->id,
            'source_type' => $sourceType,
            'source_id' => $this->registration->source_id,
            'source_detail_id' => $this->registration->source_detail_id,
            'warranty_end_date' => optional($this->registration->warranty_end_date)->toDateString(),
            'days_left' => $this->daysLeft,
            'context' => 'warranty-expiring-unified',
        ];
    }
}
