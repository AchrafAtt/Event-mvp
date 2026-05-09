<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class TicketVerificationController extends Controller
{
    /**
     * Public ticket verification (QR payload target).
     */
    public function show(Request $request, string $token): Response|SymfonyResponse
    {
        $reservation = Reservation::query()
            ->where('ticket_token', $token)
            ->with(['evenement'])
            ->first();

        if ($reservation === null) {
            abort(404);
        }

        $eventDate = $reservation->evenement?->date?->format('Y-m-d')
            ?? $reservation->date_reservation->format('Y-m-d');

        return Inertia::render('tickets/show', [
            'reference' => $reservation->reference,
            'statut' => $reservation->statut->value,
            'eventDate' => $eventDate,
            'eventType' => $reservation->evenement?->type_evenement?->value ?? null,
        ]);
    }
}
