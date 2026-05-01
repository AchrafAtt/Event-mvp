<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecuPaiementController extends Controller
{
    /**
     * Upload d'un reçu de paiement pour une réservation.
     */
    public function store(Request $request, Reservation $reservation): RedirectResponse
    {
        $this->authorize('view', $reservation);

        $request->validate([
            'recu' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $file = $request->file('recu');
        $path = $file->store('recus', 'local');

        $paiement = $reservation->paiements()->latest()->firstOrFail();

        $paiement->recus()->create([
            'nom_fichier' => $file->getClientOriginalName(),
            'type_fichier' => $file->getMimeType(),
            'chemin_fichier' => $path,
            'date_import' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Reçu uploadé avec succès.']);

        return to_route('reservations.show', $reservation);
    }
}
