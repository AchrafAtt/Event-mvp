<?php

namespace App\Actions;

use App\Enums\StatutReservation;
use App\Models\Reservation;
use App\Services\QrTicketImageClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class IssueReservationTicketQr
{
    public function __construct(
        private QrTicketImageClient $client,
    ) {}

    /**
     * Generate and store a QR PNG for a confirmed reservation. Idempotent if file already exists.
     */
    public function handle(Reservation $reservation): bool
    {
        if ($reservation->statut !== StatutReservation::Confirmee) {
            return false;
        }

        $path = $reservation->ticket_qr_path;
        if (is_string($path) && $path !== '' && Storage::disk('local')->exists($path)) {
            return true;
        }

        // Always mint a token for Confirmée so /tickets/{token} works even if the PNG service is down.
        if ($reservation->ticket_token === null || $reservation->ticket_token === '') {
            $reservation->forceFill(['ticket_token' => Str::random(48)])->saveQuietly();
            $reservation->refresh();
        }

        $baseUrl = rtrim((string) config('services.qr_ticket.url'), '/');
        if ($baseUrl === '') {
            Log::warning('IssueReservationTicketQr skipped: QR_TICKET_SERVICE_URL is empty. Ticket verify URL still available.', [
                'reservation_id' => $reservation->id,
            ]);

            return false;
        }

        $verifyUrl = route('tickets.show', ['token' => $reservation->ticket_token], absolute: true);

        try {
            $png = $this->client->generatePng($verifyUrl);
        } catch (\Throwable $e) {
            Log::error('IssueReservationTicketQr failed', [
                'reservation_id' => $reservation->id,
                'exception' => $e->getMessage(),
            ]);

            return false;
        }

        $diskPath = 'tickets/'.$reservation->id.'.png';
        Storage::disk('local')->put($diskPath, $png);

        $reservation->forceFill([
            'ticket_qr_path' => $diskPath,
            'ticket_generated_at' => now(),
        ])->saveQuietly();

        return true;
    }

    /**
     * When a reservation is confirmed but has no usable QR image URL yet (e.g. microservice was down
     * when the admin confirmed), try generating again on the next page load.
     */
    public function ensureIssuedIfConfirmed(Reservation $reservation): void
    {
        if ($reservation->statut !== StatutReservation::Confirmee) {
            return;
        }

        if ($reservation->ticketQrAbsoluteUrl() !== null) {
            return;
        }

        $this->handle($reservation->fresh());
    }
}
