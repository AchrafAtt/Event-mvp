<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PaiementController extends Controller
{
    /**
     * Valider un paiement.
     */
    public function valider(Paiement $paiement): RedirectResponse
    {
        $paiement->update(['statut_paiement' => 'confirme']);

        $this->updateResteAPayer($paiement);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paiement validé.']);

        return to_route('admin.reservations.index');
    }

    /**
     * Refuser un paiement.
     */
    public function refuser(Paiement $paiement): RedirectResponse
    {
        $paiement->update(['statut_paiement' => 'refuse']);

        Inertia::flash('toast', ['type' => 'error', 'message' => 'Paiement refusé.']);

        return to_route('admin.reservations.index');
    }

    private function updateResteAPayer(Paiement $paiement): void
    {
        $reservation = $paiement->reservation;
        $totalPaye = $reservation->paiements()
            ->where('statut_paiement', 'confirme')
            ->sum('montant_avance');

        $reservation->update([
            'avance' => $totalPaye,
            'reste_a_payer' => max(0, $reservation->prix_total - $totalPaye),
        ]);
    }
}
