<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReverbHealthAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $status,
        private string $host,
        private int $port,
        private int $failureCount = 0,
        private ?string $error = null
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        if ($this->status === 'recovered') {
            return [
                'title' => 'Reverb Kembali Normal',
                'message' => "Koneksi Reverb ke {$this->host}:{$this->port} sudah pulih.",
                'reference' => "{$this->host}:{$this->port}",
                'context' => 'reverb-health-recovered',
                'status' => 'recovered',
            ];
        }

        $message = "Reverb tidak dapat dijangkau di {$this->host}:{$this->port}";
        if ($this->failureCount > 0) {
            $message .= " ({$this->failureCount}x berturut-turut)";
        }
        if (!empty($this->error)) {
            $message .= ". Error: {$this->error}";
        }

        return [
            'title' => 'Reverb Down Terdeteksi',
            'message' => $message,
            'reference' => "{$this->host}:{$this->port}",
            'context' => 'reverb-health-down',
            'status' => 'down',
            'failure_count' => $this->failureCount,
        ];
    }
}
