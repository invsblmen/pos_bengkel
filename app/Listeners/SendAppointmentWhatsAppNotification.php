<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Events\AppointmentUpdated;
use App\Events\WhatsAppOutboundUpdated;
use App\Jobs\SendWhatsAppMessageJob;
use App\Models\Appointment;
use App\Models\WhatsAppOutboundMessage;
use Illuminate\Support\Carbon;

class SendAppointmentWhatsAppNotification
{
    public function handle(AppointmentCreated|AppointmentUpdated $event): void
    {
        if (!config('whatsapp.enabled')) {
            return;
        }

        $appointmentId = (int) ($event->appointment['id'] ?? 0);
        if ($appointmentId <= 0) {
            return;
        }

        $appointment = Appointment::with(['customer', 'vehicle', 'mechanic'])->find($appointmentId);
        if (!$appointment || !$appointment->customer || empty($appointment->customer->phone)) {
            return;
        }

        $isCreated = $event instanceof AppointmentCreated;
        $message = $this->buildMessage($appointment, $isCreated);

        $outbound = WhatsAppOutboundMessage::create([
            'event_type' => $isCreated ? 'appointment.created' : 'appointment.updated',
            'related_type' => 'appointment',
            'related_id' => $appointment->id,
            'customer_id' => $appointment->customer_id,
            'device_id' => config('whatsapp.api.device_id'),
            'phone' => $appointment->customer->phone,
            'message' => $message,
            'status' => 'queued',
        ]);

        event(new WhatsAppOutboundUpdated($outbound));

        SendWhatsAppMessageJob::dispatch($outbound->id)
            ->onQueue((string) config('whatsapp.notifications.queue', 'default'));
    }

    private function buildMessage(Appointment $appointment, bool $isCreated): string
    {
        $customerName = $appointment->customer?->name ?? 'Pelanggan';
        $vehiclePlate = $appointment->vehicle?->plate_number ?? '-';
        $mechanicName = $appointment->mechanic?->name ?? '-';
        $status = strtoupper((string) $appointment->status);
        $workshopName = (string) config('app.name');

        $scheduledAt = $appointment->scheduled_at
            ? Carbon::parse($appointment->scheduled_at)->timezone(config('app.timezone'))->format('d-m-Y H:i')
            : '-';

        if ($isCreated) {
            return implode("\n", [
                "Halo {$customerName},",
                'Appointment service Anda berhasil dibuat.',
                "Jadwal: {$scheduledAt}",
                "Plat Kendaraan: {$vehiclePlate}",
                "Mekanik: {$mechanicName}",
                "Status: {$status}",
                "Bengkel: {$workshopName}",
                'Sampai jumpa di bengkel kami.',
            ]);
        }

        return implode("\n", [
            "Halo {$customerName},",
            'Appointment service Anda diperbarui.',
            "Jadwal terbaru: {$scheduledAt}",
            "Plat Kendaraan: {$vehiclePlate}",
            "Mekanik: {$mechanicName}",
            "Status: {$status}",
            "Bengkel: {$workshopName}",
            'Terima kasih.',
        ]);
    }
}
