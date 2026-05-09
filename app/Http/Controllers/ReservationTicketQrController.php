<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ReservationTicketQrController extends Controller
{
    /**
     * Stream the stored ticket QR image (owner or admin).
     */
    public function show(Request $request, Reservation $reservation): Response
    {
        $this->authorize('view', $reservation);

        $path = $reservation->ticket_qr_path;
        if (! is_string($path) || $path === '' || ! Storage::disk('local')->exists($path)) {
            abort(404);
        }

        return Storage::disk('local')->response($path, 'ticket-'.$reservation->reference.'.png', [
            'Content-Type' => 'image/png',
        ]);
    }
}
